import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { SearchDto } from './search.dto.js';
import { SearchService } from './search.service.js';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async search(@Body() dto: SearchDto, @Res() res: Response) {
    const result = await this.searchService.search(dto);
    res.status(result.status).json(result);
  }
}
