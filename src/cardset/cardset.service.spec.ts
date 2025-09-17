import { Test, TestingModule } from '@nestjs/testing';
import { CardsetService } from './cardset.service';

describe('CardsetService', () => {
  let service: CardsetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardsetService],
    }).compile();

    service = module.get<CardsetService>(CardsetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
