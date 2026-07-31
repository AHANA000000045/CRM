import { Controller, Get, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { BdeService } from './bde.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('bde')
@UseGuards(JwtAuthGuard)
export class BdeController {
  constructor(private readonly bdeService: BdeService) {}

  @Get('decision-center')
  @HttpCode(HttpStatus.OK)
  async getDecisionCenter(@Req() req: any) {
    const orgId = req.user?.organizationId;
    return this.bdeService.getDecisionCenter(orgId);
  }
}
