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
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);
  private readonly heartbeatInterval = 10000; // 10초
  private heartbeatTimers = new Map<string, NodeJS.Timeout>();
  private documentMap = new Map<string, Y.Doc>(); // documentId -> Y.Doc

  constructor() {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // 10초마다 헬스체크 시작
    this.startHeartbeat(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.logger.log(`Disconnect reason: ${client.disconnected ? 'Client initiated' : 'Server initiated'}`);

    this.stopHeartbeat(client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinDocument(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; userId?: string },
  ) {
    try {
      this.logger.log(
        `Client ${client.id} joining document: ${data.documentId}`,
      );

      // 클라이언트를 룸에 조인
      client.join(data.documentId);

      // Yjs 문서 초기화 또는 가져오기
      let doc = this.documentMap.get(data.documentId);
      if (!doc) {
        doc = new Y.Doc();
        this.documentMap.set(data.documentId, doc);
      }

      // 클라이언트에게 현재 문서 상태 전송
      const state = Y.encodeStateAsUpdate(doc);
      client.emit('yjs-update', {
        documentId: data.documentId,
        update: Array.from(state),
      });

      // 조인 성공 응답
      client.emit('joinRoom', {
        documentId: data.documentId,
        clientId: client.id,
        timestamp: new Date().toISOString(),
      });

      // 다른 클라이언트들에게 새 클라이언트 알림
      client.to(data.documentId).emit('user-joined', {
        clientId: client.id,
        userId: data.userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error joining document: ${error instanceof Error ? error.message : 'Unknown error'}`);
      client.emit('error', { message: 'Failed to join document' });
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveDocument(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string },
  ) {
    try {
      this.logger.log(
        `Client ${client.id} leaving document: ${data.documentId}`,
      );

      // YJS 서비스 제거로 인한 간단한 처리

      // 룸에서 나가기
      client.leave(data.documentId);

      // 나가기 성공 응답
      client.emit('userLeft', {
        documentId: data.documentId,
        clientId: client.id,
        timestamp: new Date().toISOString(),
      });

      // 다른 클라이언트들에게 클라이언트 나감 알림
      client.to(data.documentId).emit('userLeft', {
        clientId: client.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error leaving document: ${error instanceof Error ? error.message : 'Unknown error'}`);
      client.emit('error', { message: 'Failed to leave document' });
    }
  }

  @SubscribeMessage('sendMessage')
  handleTextUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; field: string; content: string },
  ) {
    try {
      this.logger.log(`Received text update from client ${client.id} for document ${data.documentId} (${data.field})`);
      
      // 텍스트 업데이트를 다른 클라이언트들에게 브로드캐스트
      client.to(data.documentId).emit('text-update', {
        documentId: data.documentId,
        field: data.field,
        content: data.content,
        fromClientId: client.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error broadcasting text update: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  @SubscribeMessage('yjs-message')
  handleYjsMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId?: string; type: string; data: any },
  ) {
    try {
      this.logger.log(`Received yjs-message from client ${client.id}: ${JSON.stringify(data)}`);
      
      const { documentId, type, data: messageData } = data;
      
      // auth 메시지 처리
      if (type === 'auth') {
        this.handleAuth(client, messageData);
        return;
      }
      
      // documentId가 없으면 에러
      if (!documentId) {
        this.logger.warn(`Document ID required for client ${client.id}`);
        client.emit('error', { message: 'Document ID required' });
        return;
      }
      
      const doc = this.documentMap.get(documentId);
      
      if (!doc) {
        this.logger.warn(`Document not found: ${documentId} for client ${client.id}`);
        client.emit('error', { message: 'Document not found' });
        return;
      }

      switch (type) {
        case 'sync':
          this.handleSyncMessage(client, doc, documentId, messageData);
          break;
        case 'update':
          this.handleUpdateMessage(client, doc, documentId, messageData);
          break;
        case 'awareness':
          this.handleAwarenessMessage(client, doc, documentId, messageData);
          break;
        default:
          this.logger.warn(`Unknown message type: ${type} from client ${client.id}`);
      }
    } catch (error) {
      this.logger.error(`Error processing YJS message from client ${client.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.logger.error(`Raw data: ${JSON.stringify(data)}`);
    }
  }

  private handleSyncMessage(client: Socket, doc: Y.Doc, documentId: string, data: any) {
    const { syncStep, update } = data;

    if (syncStep === 0) {
      // Step 0: 클라이언트가 현재 상태 벡터 전송
      const stateVector = Y.encodeStateVector(doc);
      client.emit('yjs-message', {
        type: 'sync',
        data: { syncStep: 1, update: Array.from(stateVector) }
      });
    } else if (syncStep === 1 && update) {
      // Step 1: 서버가 차이점 전송
      const diff = Y.encodeStateAsUpdate(doc, new Uint8Array(update));
      client.emit('yjs-message', {
        type: 'sync',
        data: { syncStep: 1, update: Array.from(diff) }
      });
    }
  }

  private handleUpdateMessage(client: Socket, doc: Y.Doc, documentId: string, data: any) {
    const { update } = data;
    Y.applyUpdate(doc, new Uint8Array(update));
    
    // 다른 클라이언트들에게 업데이트 브로드캐스트
    client.to(documentId).emit('yjs-message', {
      type: 'update',
      data: { update: Array.from(update) }
    });
  }

  private handleAwarenessMessage(client: Socket, doc: Y.Doc, documentId: string, data: any) {
    const { awareness } = data;
    
    // 다른 클라이언트들에게 awareness 브로드캐스트
    client.to(documentId).emit('yjs-message', {
      type: 'awareness',
      data: { awareness: Array.from(awareness) }
    });
  }

  private handleAuth(client: Socket, data: { token: string; userId: string; documentId: string }) {
    try {
      this.logger.log(`Received auth from client ${client.id}, userId: ${data.userId}, documentId: ${data.documentId}`);
      this.logger.log(`Auth data: ${JSON.stringify(data)}`);
      
      // TODO: 실제 JWT 토큰 검증 로직 구현
      // 임시로 토큰이 있으면 인증 성공으로 처리
      const hasAccess = true;
      
      const accessControlMessage = {
        data: {
          hasAccess,
          message: hasAccess ? 'Authentication successful' : 'Authentication failed',
        },
        clientId: client.id,
        timestamp: new Date().toISOString(),
      };
      
      this.logger.log(`Sending access-control to client ${client.id}: ${JSON.stringify(accessControlMessage)}`);
      client.emit('access-control', accessControlMessage);
      
      // 클라이언트가 이벤트를 받을 시간을 주기 위해 약간의 지연
      setTimeout(() => {
        this.logger.log(`Auth result for client ${client.id}: ${hasAccess}`);
      }, 100);
    } catch (error) {
      this.logger.error(`Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  @SubscribeMessage('heartbeat')
  handleHeartbeat(@ConnectedSocket() client: Socket) {
    // 클라이언트로부터 heartbeat 응답 받음
    this.logger.log(`Received heartbeat from client ${client.id}`);
    client.emit('heartbeat-ack', {
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  private startHeartbeat(client: Socket) {
    const timer = setInterval(() => {
      // 클라이언트가 연결되어 있는지 확인
      if (!client.connected) {
        this.logger.warn(`Client ${client.id} is not connected, stopping heartbeat`);
        this.stopHeartbeat(client.id);
        return;
      }

      // 클라이언트에게 heartbeat 전송
      client.emit('heartbeat', {
        timestamp: new Date().toISOString(),
      });
    }, this.heartbeatInterval);

    this.heartbeatTimers.set(client.id, timer);
  }

  private stopHeartbeat(clientId: string) {
    const timer = this.heartbeatTimers.get(clientId);
    if (timer) {
      clearInterval(timer);
      this.heartbeatTimers.delete(clientId);
    }
  }
}