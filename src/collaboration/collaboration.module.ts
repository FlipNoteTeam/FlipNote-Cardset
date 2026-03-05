import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { YjsDocumentOrmEntity } from './infrastructure/persistence/orm/yjs-document.orm-entity';
import { YjsDocumentRepositoryImpl } from './infrastructure/persistence/yjs-document.repository.impl';
import { YJS_DOCUMENT_REPOSITORY } from './domain/repository/yjs-document.repository';
import { CollaborationUseCase } from './application/collaboration.use-case';
import { CollaborationGateway } from './infrastructure/gateway/collaboration.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([YjsDocumentOrmEntity]), AuthModule],
  providers: [
    { provide: YJS_DOCUMENT_REPOSITORY, useClass: YjsDocumentRepositoryImpl },
    CollaborationUseCase,
    CollaborationGateway,
  ],
})
export class CollaborationModule {}
