import { Test, TestingModule } from '@nestjs/testing';
import { CardsetManagerService } from './cardset-manager.service';

describe('CardsetManagerService', () => {
  let service: CardsetManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardsetManagerService],
    }).compile();

    service = module.get<CardsetManagerService>(CardsetManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
