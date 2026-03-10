import { Observable } from 'rxjs';

// ── cardset.proto 메시지 타입 ─────────────────────────────────────

export interface GetCardsetRequest {
  id: number;
}

export interface CardsetGrpcResponse {
  id: number;
  name: string;
  groupId: number;
  visibility: string;
  category: string;
  hashtag: string;
  imageRefId: number;
  cardCount: number;
}

// ── 서비스 클라이언트 인터페이스 ────────────────────────────────────
// 다른 서비스에서 이 서버를 호출할 때 사용하는 클라이언트 타입

export interface CardsetServiceClient {
  getCardset(data: GetCardsetRequest): Observable<CardsetGrpcResponse>;
}
