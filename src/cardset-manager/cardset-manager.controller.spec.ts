import { Test, TestingModule } from '@nestjs/testing';
import { CardsetManagerController } from './cardset-manager.controller';
import { CardsetManagerService } from './cardset-manager.service';

describe('CardsetManagerController', () => {
  let controller: CardsetManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsetManagerController],
      providers: [CardsetManagerService],
    }).compile();

    controller = module.get<CardsetManagerController>(CardsetManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
