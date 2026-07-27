import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { Organization, OrganizationDocument } from '../organizations/schemas/organization.schema';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Organization.name) private orgModel: Model<OrganizationDocument>,
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto, organizationId: string): Promise<UserDocument> {
    const { email, password, firstName, lastName, role } = createUserDto;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      organizationId: new Types.ObjectId(organizationId),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    });

    const savedUser = await newUser.save();

    // Dispatch invitation email asynchronously in background
    this.sendInviteEmailAsync(savedUser, password, organizationId);

    return savedUser;
  }

  private async sendInviteEmailAsync(user: UserDocument, rawPassword: string, organizationId: string) {
    try {
      const org = await this.orgModel.findById(organizationId).exec();
      const orgName = org ? org.name : 'FlowCRM';
      const fullName = `${user.firstName} ${user.lastName}`;
      await this.mailService.sendInvitation(user.email, fullName, orgName, rawPassword);
    } catch (err) {
      console.error('Failed to send background invitation email:', err);
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).populate('organizationId').exec();
  }

  async findAllByOrganization(organizationId: string): Promise<UserDocument[]> {
    return this.userModel
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .select('-password') // Exclude password hash from lists
      .exec();
  }

  async updateStatus(id: string, organizationId: string, isActive: boolean): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.organizationId.toString() !== organizationId.toString()) {
      throw new ForbiddenException('Unauthorized tenant access');
    }

    user.isActive = isActive;
    return user.save();
  }
}
