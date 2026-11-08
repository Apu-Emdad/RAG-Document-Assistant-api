import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AskDto } from './ask.dto.js';
import { AskService } from './ask.service.js';

@ApiTags('Ask')
@Controller('ask')
export class AskController {
  constructor(private readonly askService: AskService) {}

  @Post()
  async ask(@Body() dto: AskDto, @Res() res: Response) {
    const result = await this.askService.ask(dto);
    res.status(result.status).json(result);
  }
}
