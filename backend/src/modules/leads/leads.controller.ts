import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createLead(@Req() req: any, @Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto, req.user.organizationId, req.user.userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getLeads(@Req() req: any) {
    return this.leadsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getLead(@Req() req: any, @Param('id') id: string) {
    return this.leadsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateLead(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.update(id, updateLeadDto, req.user.organizationId);
  }

  @Post(':id/convert')
  @HttpCode(HttpStatus.OK)
  async convertLead(@Req() req: any, @Param('id') id: string) {
    return this.leadsService.convert(id, req.user.organizationId, req.user.userId);
  }
}
