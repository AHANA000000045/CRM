import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('deals')
@UseGuards(JwtAuthGuard)
export class DealsController {
  constructor(private dealsService: DealsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDeal(@Req() req: any, @Body() createDealDto: CreateDealDto) {
    return this.dealsService.create(createDealDto, req.user.organizationId, req.user.userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getDeals(@Req() req: any) {
    return this.dealsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getDeal(@Req() req: any, @Param('id') id: string) {
    return this.dealsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateDeal(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateDealDto: UpdateDealDto,
  ) {
    return this.dealsService.update(id, updateDealDto, req.user.organizationId);
  }
}
