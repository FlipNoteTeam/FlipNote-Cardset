import { HttpStatus } from '@nestjs/common';

export class ErrorCode {
  constructor(
    public readonly status: HttpStatus,
    public readonly code: string,
    public readonly message: string,
  ) {}

  // Cardset
  static readonly CARDSET_NOT_FOUND = new ErrorCode(HttpStatus.NOT_FOUND, 'CARDSET_001', '카드셋을 찾을 수 없습니다');
  static readonly CARDSET_ACCESS_DENIED = new ErrorCode(HttpStatus.FORBIDDEN, 'CARDSET_002', '카드셋에 접근할 수 없습니다');
  static readonly CARDSET_MANAGER_REQUIRED = new ErrorCode(HttpStatus.FORBIDDEN, 'CARDSET_003', '카드셋 매니저만 접근할 수 있습니다');

  // Card
  static readonly CARD_NOT_FOUND = new ErrorCode(HttpStatus.NOT_FOUND, 'CARD_001', '카드를 찾을 수 없습니다');
  static readonly CARD_INVALID_ORDER = new ErrorCode(HttpStatus.BAD_REQUEST, 'CARD_002', '카드 순서가 유효하지 않습니다');

  // Group (gRPC)
  static readonly GROUP_NOT_IN = new ErrorCode(HttpStatus.FORBIDDEN, 'GROUP_001', '해당 그룹에 속한 유저가 아닙니다');

  // Common
  static readonly INVALID_INPUT = new ErrorCode(HttpStatus.BAD_REQUEST, 'COMMON_001', '잘못된 입력입니다');
  static readonly INTERNAL_SERVER_ERROR = new ErrorCode(HttpStatus.INTERNAL_SERVER_ERROR, 'COMMON_002', '서버 오류가 발생했습니다');
}
