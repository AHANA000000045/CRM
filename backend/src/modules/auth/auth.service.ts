import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { Organization, OrganizationDocument } from '../organizations/schemas/organization.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(Organization.name) private organizationModel: Model<OrganizationDocument>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { organizationName, domain, email, password, firstName, lastName } = registerDto;

    // Check if domain is already registered
    const existingOrg = await this.organizationModel.findOne({ domain: domain.toLowerCase() }).exec();
    if (existingOrg) {
      throw new ConflictException('Organization with this domain already exists');
    }

    // Check if user is already registered
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 1. Create Organization
    const newOrg = new this.organizationModel({
      name: organizationName,
      domain: domain.toLowerCase(),
      billingPlan: 'Free',
      isActive: true,
    });
    const savedOrg = await newOrg.save();

    // 2. Create User (as Organization Admin)
    const newUser = await this.usersService.create(
      {
        email,
        password,
        firstName,
        lastName,
        role: Role.ORGANIZATION_ADMIN,
      },
      (savedOrg._id as any).toString(),
    );

    return {
      message: 'Registration successful',
      userId: newUser._id,
      organizationId: savedOrg._id,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Sign JWT
    const payload = {
      sub: (user._id as any).toString(),
      email: user.email,
      organizationId: (user.organizationId as any).toString(),
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
