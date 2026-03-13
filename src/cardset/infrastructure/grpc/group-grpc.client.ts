import { Inject, Injectable, OnModuleInit, ForbiddenException } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';

interface GroupCommandService {
  checkUserInGroup(data: {
    groupId: number;
    userId: number;
  }): Observable<{ exists: boolean }>;
}

@Injectable()
export class GroupGrpcClient implements OnModuleInit {
  private groupService: GroupCommandService;

  constructor(@Inject('GROUP_GRPC_CLIENT') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.groupService = this.client.getService<GroupCommandService>('GroupCommandService');
  }

  async checkUserInGroup(groupId: number, userId: number): Promise<void> {
    const result = await firstValueFrom(
      this.groupService.checkUserInGroup({ groupId, userId }),
    );
    if (!result.exists) {
      throw new ForbiddenException('해당 그룹에 속한 유저가 아닙니다.');
    }
  }

  async isUserInGroup(groupId: number, userId: number): Promise<boolean> {
    const result = await firstValueFrom(
      this.groupService.checkUserInGroup({ groupId, userId }),
    );
    return result.exists;
  }
}
