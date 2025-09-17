import { Test, TestingModule } from '@nestjs/testing';
import { CardsetController } from './cardset.controller';
import { CardsetService } from './cardset.service';

describe('CardsetController', () => {
  let controller: CardsetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsetController],
      providers: [CardsetService],
    }).compile();

    controller = module.get<CardsetController>(CardsetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
