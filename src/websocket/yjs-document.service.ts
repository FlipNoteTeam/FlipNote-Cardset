import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Y from 'yjs';
import { YjsDocument } from './entities/yjs-document.entity';

@Injectable()
export class YjsDocumentService {
  private readonly logger = new Logger(YjsDocumentService.name);
  private documentCache = new Map<number, Y.Doc>();

  constructor(
    @InjectRepository(YjsDocument)
    private yjsDocumentRepository: Repository<YjsDocument>,
  ) {}

  async getOrCreateDocument(cardsetId: number): Promise<Y.Doc> {
    // 캐시에서 먼저 확인
    if (this.documentCache.has(cardsetId)) {
      return this.documentCache.get(cardsetId)!;
    }

    // DB에서 문서 로드 시도
    let yjsDoc = await this.yjsDocumentRepository.findOne({
      where: { cardsetId },
    });

    let doc: Y.Doc;

    if (yjsDoc) {
      // DB에서 문서 복원
      doc = new Y.Doc();
      Y.applyUpdate(doc, yjsDoc.documentData);
      this.logger.log(`Loaded Yjs document for cardset ${cardsetId} from DB`);
    } else {
      // 새 문서 생성
      doc = new Y.Doc();
      await this.saveDocument(cardsetId, doc);
      this.logger.log(`Created new Yjs document for cardset ${cardsetId}`);
    }

    // 변경사항 감지하여 DB에 자동 저장
    doc.on('update', async (update: Uint8Array) => {
      await this.saveDocument(cardsetId, doc);
    });

    // 캐시에 저장
    this.documentCache.set(cardsetId, doc);
    return doc;
  }

  async saveDocument(cardsetId: number, doc: Y.Doc): Promise<void> {
    try {
      const state = Y.encodeStateAsUpdate(doc);
      
      const existingDoc = await this.yjsDocumentRepository.findOne({
        where: { cardsetId },
      });

      if (existingDoc) {
        await this.yjsDocumentRepository.update(existingDoc.id, {
          documentData: Buffer.from(state),
          version: existingDoc.version + 1,
        });
      } else {
        const yjsDoc = this.yjsDocumentRepository.create({
          cardsetId,
          documentData: Buffer.from(state),
          version: 1,
        });
        await this.yjsDocumentRepository.save(yjsDoc);
      }
    } catch (error) {
      this.logger.error(`Failed to save Yjs document for cardset ${cardsetId}:`, error);
    }
  }

  async deleteDocument(cardsetId: number): Promise<void> {
    await this.yjsDocumentRepository.delete({ cardsetId });
    this.documentCache.delete(cardsetId);
    this.logger.log(`Deleted Yjs document for cardset ${cardsetId}`);
  }

  // DB에서 카드 데이터를 Yjs 문서로 동기화
  async syncCardsFromDB(cardsetId: number, cards: any[]): Promise<void> {
    const doc = await this.getOrCreateDocument(cardsetId);
    const cardsArray = doc.getArray('cards');
    
    // 기존 카드 모두 삭제
    cardsArray.delete(0, cardsArray.length);
    
    // DB 카드들을 Yjs에 추가
    const yjsCards = cards.map(card => ({
      id: card.id,
      title: card.title,
      content: card.content,
      order: card.order,
      cardsetId: card.cardsetId,
      createdAt: card.createdAt?.toISOString(),
      updatedAt: card.updatedAt?.toISOString(),
    }));
    
    cardsArray.insert(0, yjsCards);
    this.logger.log(`Synced ${cards.length} cards from DB to Yjs for cardset ${cardsetId}`);
  }
}
