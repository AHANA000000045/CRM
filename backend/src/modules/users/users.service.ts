import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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

    return newUser.save();
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
