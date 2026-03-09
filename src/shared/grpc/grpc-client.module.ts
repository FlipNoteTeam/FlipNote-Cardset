import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

/**
 * 외부 gRPC 서비스를 호출하는 클라이언트 모듈
 *
 * 사용 예시:
 *   @Inject('CARDSET_GRPC_CLIENT') private client: ClientGrpc
 *   this.cardsetService = this.client.getService<CardsetServiceClient>('CardsetService')
 */
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CARDSET_GRPC_CLIENT',
        transport: Transport.GRPC,
        options: {
          package: 'cardset',
          protoPath: join(__dirname, '../proto/cardset.proto'),
          url: process.env.CARDSET_GRPC_URL ?? 'localhost:5000',
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GrpcClientModule {}
