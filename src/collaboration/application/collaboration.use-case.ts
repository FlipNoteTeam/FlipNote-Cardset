import { Inject, Injectable, Logger } from '@nestjs/common';
import * as Y from 'yjs';
import { YJS_DOCUMENT_REPOSITORY } from '../domain/repository/yjs-document.repository';
import type { IYjsDocumentRepository } from '../domain/repository/yjs-document.repository';
import { YjsDocument } from '../domain/model/yjs-document';

@Injectable()
export class CollaborationUseCase {
  private readonly logger = new Logger(CollaborationUseCase.name);
  private documentCache = new Map<number, Y.Doc>();
  private persistDebounceMap = new Map<number, NodeJS.Timeout>();

  constructor(
    @Inject(YJS_DOCUMENT_REPOSITORY)
    private readonly yjsDocumentRepository: IYjsDocumentRepository,
  ) {}

  async getOrCreateDocument(cardsetId: number): Promise<Y.Doc> {
    if (this.documentCache.has(cardsetId)) {
      return this.documentCache.get(cardsetId)!;
    }

    const stored = await this.yjsDocumentRepository.findByCardsetId(cardsetId);
    let doc: Y.Doc;

    if (stored) {
      doc = new Y.Doc();
      Y.applyUpdate(doc, stored.documentData);
      this.logger.log(`Loaded Yjs document for cardset ${cardsetId} from DB`);
    } else {
      doc = new Y.Doc();
      await this.persistDocument(cardsetId, doc);
      this.logger.log(`Created new Yjs document for cardset ${cardsetId}`);
    }

    doc.on('update', () => {
      const existing = this.persistDebounceMap.get(cardsetId);
      if (existing) clearTimeout(existing);
      this.persistDebounceMap.set(
        cardsetId,
        setTimeout(() => {
          void this.persistDocument(cardsetId, doc);
          this.persistDebounceMap.delete(cardsetId);
        }, 500),
      );
    });

    this.documentCache.set(cardsetId, doc);
    return doc;
  }

  async applyUpdate(cardsetId: number, update: number[]): Promise<Uint8Array> {
    const doc = await this.getOrCreateDocument(cardsetId);
    Y.applyUpdate(doc, new Uint8Array(update));
    return Y.encodeStateAsUpdate(doc);
  }

  async getState(cardsetId: number): Promise<Uint8Array> {
    const doc = await this.getOrCreateDocument(cardsetId);
    return Y.encodeStateAsUpdate(doc);
  }

  async syncCardsFromDB(
    cardsetId: number,
    cards: {
      id: number;
      content: string;
      order: number;
      cardsetId: number;
      createdAt: { toISOString(): string } | null;
      updatedAt: { toISOString(): string } | null;
    }[],
  ): Promise<void> {
    const doc = await this.getOrCreateDocument(cardsetId);
    const cardsArray = doc.getArray('cards');

    cardsArray.delete(0, cardsArray.length);

    const yjsCards = cards.map((card) => ({
      id: card.id,
      content: card.content,
      order: card.order,
      cardsetId: card.cardsetId,
      createdAt: card.createdAt?.toISOString(),
      updatedAt: card.updatedAt?.toISOString(),
    }));

    cardsArray.insert(0, yjsCards);
    this.logger.log(
      `Synced ${cards.length} cards to Yjs for cardset ${cardsetId}`,
    );
  }

  async deleteDocument(cardsetId: number): Promise<void> {
    await this.yjsDocumentRepository.deleteByCardsetId(cardsetId);
    this.documentCache.delete(cardsetId);
    this.logger.log(`Deleted Yjs document for cardset ${cardsetId}`);
  }

  private async persistDocument(cardsetId: number, doc: Y.Doc): Promise<void> {
    try {
      const state = Y.encodeStateAsUpdate(doc);
      const stored =
        await this.yjsDocumentRepository.findByCardsetId(cardsetId);

      if (stored) {
        const updated = stored.withNewData(Buffer.from(state));
        await this.yjsDocumentRepository.update(stored.id, updated);
      } else {
        const newDoc = YjsDocument.create({
          cardsetId,
          documentData: Buffer.from(state),
        });
        await this.yjsDocumentRepository.save(newDoc);
      }
    } catch (error) {
      this.logger.error(
        `Failed to persist Yjs document for cardset ${cardsetId}:`,
        error,
      );
    }
  }
}
