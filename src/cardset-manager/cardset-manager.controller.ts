import { Controller } from '@nestjs/common';
import { CardsetManagerService } from './cardset-manager.service';

@Controller('cardset-manager')
export class CardsetManagerController {
  constructor(private readonly cardsetManagerService: CardsetManagerService) {}
}
