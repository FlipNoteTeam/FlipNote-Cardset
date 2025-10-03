import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as Y from 'yjs';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/cardsets',
  pingTimeout: 60000, // 60초
  pingInterval: 25000, // 25초
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);
  private documentMap = new Map<string, Y.Doc>(); // documentId -> Y.Doc

  constructor() {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Socket.IO의 내장 PING/PONG 하트비트가 자동으로 처리됩니다
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.logger.log(
      `Disconnect reason: ${client.disconnected ? 'Client initiated' : 'Server initiated'}`,
    );
  }

  @SubscribeMessage('sync')
  handleSync(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; syncStep: number; update?: number[] },
  ) {
    try {
      this.logger.log(
        `Received sync from client ${client.id} for document ${data.documentId}`,
      );

      // 클라이언트를 룸에 조인
      void client.join(data.documentId);

      // Yjs 문서 초기화 또는 가져오기
      let doc = this.documentMap.get(data.documentId);
      if (!doc) {
        doc = new Y.Doc();
        this.documentMap.set(data.documentId, doc);
        this.logger.log(`Created new document: ${data.documentId}`);
      }

      this.handleSyncMessage(client, doc, data.documentId, data);
    } catch (error) {
      this.logger.error(
        `Error processing sync from client ${client.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @SubscribeMessage('update')
  handleUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; update: number[] },
  ) {
    try {
      this.logger.log(
        `Received update from client ${client.id} for document ${data.documentId}`,
      );

      // 클라이언트를 룸에 조인
      void client.join(data.documentId);

      // Yjs 문서 초기화 또는 가져오기
      let doc = this.documentMap.get(data.documentId);
      if (!doc) {
        doc = new Y.Doc();
        this.documentMap.set(data.documentId, doc);
        this.logger.log(`Created new document: ${data.documentId}`);
      }

      this.handleUpdateMessage(client, doc, data.documentId, data);
    } catch (error) {
      this.logger.error(
        `Error processing update from client ${client.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @SubscribeMessage('awareness')
  handleAwareness(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; awareness: number[] },
  ) {
    try {
      this.logger.log(
        `Received awareness from client ${client.id} for document ${data.documentId}`,
      );

      // 클라이언트를 룸에 조인
      void client.join(data.documentId);

      // Yjs 문서 초기화 또는 가져오기
      let doc = this.documentMap.get(data.documentId);
      if (!doc) {
        doc = new Y.Doc();
        this.documentMap.set(data.documentId, doc);
        this.logger.log(`Created new document: ${data.documentId}`);
      }

      this.handleAwarenessMessage(client, doc, data.documentId, data);
    } catch (error) {
      this.logger.error(
        `Error processing awareness from client ${client.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @SubscribeMessage('auth')
  handleAuthMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { token: string; userId: string; documentId: string },
  ) {
    try {
      this.logger.log(
        `Received auth from client ${client.id}, userId: ${data.userId}, documentId: ${data.documentId}`,
      );

      this.handleAuth(client, data);
    } catch (error) {
      this.logger.error(
        `Error processing auth from client ${client.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private handleSyncMessage(
    client: Socket,
    doc: Y.Doc,
    documentId: string,
    data: any,
  ) {
    const { syncStep, update } = data as {
      syncStep: number;
      update?: number[];
    };

    this.logger.log(
      `[SYNC] Document: ${documentId}, Client: ${client.id}, Step: ${syncStep}, Update length: ${update?.length || 0}`,
    );

    if (syncStep === 0) {
      // Step 0: 클라이언트가 현재 상태 벡터 전송
      const stateVector = Y.encodeStateVector(doc);
      this.logger.log(
        `[SYNC] Sending state vector to client ${client.id}, length: ${stateVector.length}`,
      );
      client.emit('sync', {
        syncStep: 1,
        update: Array.from(stateVector),
      });
    } else if (syncStep === 1 && update) {
      // Step 1: 서버가 차이점 전송
      const diff = Y.encodeStateAsUpdate(
        doc,
        new Uint8Array(update as unknown as ArrayBufferLike),
      );
      this.logger.log(
        `[SYNC] Sending diff to client ${client.id}, diff length: ${diff.length}`,
      );
      client.emit('sync', {
        syncStep: 1,
        update: Array.from(diff),
      });
    }
  }

  private handleUpdateMessage(
    client: Socket,
    doc: Y.Doc,
    documentId: string,
    data: any,
  ) {
    const { update } = data as { update: number[] };
    
    this.logger.log(
      `[UPDATE] Document: ${documentId}, Client: ${client.id}, Update length: ${update.length}`,
    );
    
    Y.applyUpdate(doc, new Uint8Array(update as unknown as ArrayBufferLike));

    // 다른 클라이언트들에게 sync 메시지로 브로드캐스트
    const roomClients = this.server.sockets.adapter.rooms.get(documentId);
    this.logger.log(
      `[UPDATE] Broadcasting to ${roomClients?.size || 0} clients in room ${documentId}`,
    );
    
    client.to(documentId).emit('sync', {
      syncStep: 1,
      update: Array.from(update),
    });
  }

  private handleAwarenessMessage(
    client: Socket,
    doc: Y.Doc,
    documentId: string,
    data: any,
  ) {
    const { awareness } = data as { awareness: number[] };

    this.logger.log(
      `[AWARENESS] Document: ${documentId}, Client: ${client.id}, Awareness length: ${awareness.length}`,
    );

    // 다른 클라이언트들에게 awareness 브로드캐스트
    const roomClients = this.server.sockets.adapter.rooms.get(documentId);
    this.logger.log(
      `[AWARENESS] Broadcasting to ${roomClients?.size || 0} clients in room ${documentId}`,
    );
    
    client.to(documentId).emit('awareness', {
      awareness: Array.from(awareness),
    });
  }

  private handleAuth(
    client: Socket,
    data: { token: string; userId: string; documentId: string },
  ) {
    try {
      this.logger.log(
        `Received auth from client ${client.id}, userId: ${data.userId}, documentId: ${data.documentId}`,
      );
      this.logger.log(`Auth data: ${JSON.stringify(data)}`);

      // TODO: 실제 JWT 토큰 검증 로직 구현
      // 임시로 토큰이 있으면 인증 성공으로 처리
      const hasAccess = true;

      const accessControlMessage = {
        data: {
          hasAccess,
          message: hasAccess
            ? 'Authentication successful'
            : 'Authentication failed',
        },
        clientId: client.id,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(
        `Sending access-control to client ${client.id}: ${JSON.stringify(accessControlMessage)}`,
      );
      client.emit('access-control', accessControlMessage);

      // 클라이언트가 이벤트를 받을 시간을 주기 위해 약간의 지연
      setTimeout(() => {
        this.logger.log(`Auth result for client ${client.id}: ${hasAccess}`);
      }, 100);
    } catch (error) {
      this.logger.error(
        `Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.logger.error(`Auth data: ${JSON.stringify(data)}`);
      client.emit('access-control', {
        data: {
          hasAccess: false,
          message: 'Authentication error',
        },
        clientId: client.id,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
