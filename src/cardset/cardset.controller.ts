import { Controller } from '@nestjs/common';
import { CardsetService } from './cardset.service';

@Controller('cardset')
export class CardsetController {
  constructor(private readonly cardsetService: CardsetService) {}
}
