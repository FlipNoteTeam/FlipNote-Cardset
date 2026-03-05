import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Headers,
} from '@nestjs/common';
import { CardsetUseCase } from '../../application/cardset.use-case';
import { CreateCardsetDto } from '../../application/dto/create-cardset.dto';
import { UpdateCardsetDto } from '../../application/dto/update-cardset.dto';
import { Cardset } from '../../domain/model/cardset';

@Controller('cardsets')
export class CardsetController {
  constructor(private readonly cardsetUseCase: CardsetUseCase) {}

  @Post()
  async create(
    @Headers('X-USER-ID') userId: string,
    @Body() dto: CreateCardsetDto,
  ): Promise<Cardset> {
    return this.cardsetUseCase.create(parseInt(userId), dto);
  }

  @Get()
  async findAll(@Headers('X-USER-ID') _userId: string): Promise<Cardset[]> {
    return this.cardsetUseCase.findAll();
  }

  @Get(':id')
  async findOne(
    @Headers('X-USER-ID') _userId: string,
    @Param('id') id: string,
  ): Promise<Cardset | null> {
    return this.cardsetUseCase.findOne(parseInt(id));
  }

  @Put(':id')
  async update(
    @Headers('X-USER-ID') _userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCardsetDto,
  ): Promise<Cardset | null> {
    return this.cardsetUseCase.update(parseInt(id), dto);
  }

  @Delete(':id')
  async remove(
    @Headers('X-USER-ID') _userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.cardsetUseCase.remove(parseInt(id));
  }

  @Put(':id/card-count')
  async updateCardCount(
    @Headers('X-USER-ID') _userId: string,
    @Param('id') id: string,
    @Body() body: { cardCount: number },
  ): Promise<Cardset | null> {
    return this.cardsetUseCase.updateCardCount(parseInt(id), body.cardCount);
  }
}
