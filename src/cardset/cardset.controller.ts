import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CardsetService } from './cardset.service';
import { Cardset } from './entities/cardset.entity';

@Controller('cardsets')
export class CardsetController {
  constructor(private readonly cardsetService: CardsetService) {}

  @Post()
  async create(@Body() cardsetData: Partial<Cardset>): Promise<Cardset> {
    return await this.cardsetService.create(cardsetData);
  }

  @Get()
  async findAll(): Promise<Cardset[]> {
    return await this.cardsetService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Cardset | null> {
    return await this.cardsetService.findOne(parseInt(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<Cardset>): Promise<Cardset | null> {
    return await this.cardsetService.update(parseInt(id), updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.cardsetService.remove(parseInt(id));
  }

  @Put(':id/card-count')
  async updateCardCount(
    @Param('id') id: string, 
    @Body() body: { cardCount: number }
  ): Promise<Cardset | null> {
    return await this.cardsetService.updateCardCount(parseInt(id), body.cardCount);
  }
}