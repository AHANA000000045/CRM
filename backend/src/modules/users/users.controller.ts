import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(@Req() req: any) {
    return this.usersService.findAllByOrganization(req.user.organizationId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZATION_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Req() req: any, @Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto, req.user.organizationId);
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    };
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ORGANIZATION_ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ) {
    const user = await this.usersService.updateStatus(id, req.user.organizationId, updateStatusDto.isActive);
    return {
      id: user._id,
      email: user.email,
      isActive: user.isActive,
    };
  }
}
