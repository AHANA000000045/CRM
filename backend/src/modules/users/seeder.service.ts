import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Organization, OrganizationDocument } from '../organizations/schemas/organization.schema';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Organization.name) private orgModel: Model<OrganizationDocument>,
  ) {}

  async onModuleInit() {
    try {
      const superAdmin = await this.userModel.findOne({ role: Role.SUPER_ADMIN }).exec();
      if (!superAdmin) {
        console.log('--- 🚀 Seeding default Super Admin user ---');

        // 1. Create System Organization
        let systemOrg = await this.orgModel.findOne({ domain: 'flowcrm.com' }).exec();
        if (!systemOrg) {
          systemOrg = new this.orgModel({
            name: 'FlowCRM System',
            domain: 'flowcrm.com',
            billingPlan: 'Enterprise',
            isActive: true,
          });
          await systemOrg.save();
        }

        // 2. Create Super Admin User
        const hashedPassword = await bcrypt.hash('SuperAdmin2026!', 10);
        const newSuperAdmin = new this.userModel({
          organizationId: systemOrg._id,
          email: 'superadmin@flowcrm.com',
          password: hashedPassword,
          firstName: 'System',
          lastName: 'Administrator',
          role: Role.SUPER_ADMIN,
          isActive: true,
        });
        await newSuperAdmin.save();
        console.log('--- ✅ Super Admin created: superadmin@flowcrm.com / SuperAdmin2026! ---');
      }
    } catch (error) {
      console.error('Error seeding Super Admin:', error);
    }
  }
}
