import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CardService } from './card.service';
import { Card } from './entities/card.entity';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  async create(@Body() cardData: Partial<Card>): Promise<Card> {
    return await this.cardService.create(cardData);
  }

  @Get('cardset/:cardsetId')
  async findByCardsetId(@Param('cardsetId') cardsetId: string): Promise<Card[]> {
    return await this.cardService.findAllByCardsetId(parseInt(cardsetId));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Card | null> {
    return await this.cardService.findOne(parseInt(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<Card>): Promise<Card | null> {
    return await this.cardService.update(parseInt(id), updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.cardService.remove(parseInt(id));
  }

  @Put('reorder')
  async reorderCards(@Body() cardOrders: { cardId: number; order: number }[]): Promise<void> {
    return await this.cardService.reorderCards(cardOrders);
  }
}