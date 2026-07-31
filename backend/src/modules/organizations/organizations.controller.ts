import { Controller, Get, Patch, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get('audit-registrations')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async getAuditRegistrations() {
    return this.orgsService.getAuditRegistrations();
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateData: { isActive?: boolean; billingPlan?: string },
  ) {
    return this.orgsService.updateStatus(id, updateData);
  }
}
