import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Organization, OrganizationDocument } from './schemas/organization.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role } from '../../common/enums/role.enum';

export interface AuditRegistrationItem {
  id: string;
  name: string;
  domain: string;
  billingPlan: string;
  isActive: boolean;
  createdAt: Date;
  headUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    createdAt?: Date;
  } | null;
  userCount: number;
}

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization.name) private orgModel: Model<OrganizationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getAuditRegistrations(): Promise<AuditRegistrationItem[]> {
    const orgs = await this.orgModel.find().sort({ createdAt: -1 }).exec();
    const result: AuditRegistrationItem[] = [];

    for (const org of orgs) {
      const users = await this.userModel.find({ organizationId: org._id }).exec();
      const headUser = users.find(
        (u) => u.role === Role.ORGANIZATION_ADMIN || u.role === Role.SUPER_ADMIN,
      ) || users[0] || null;

      result.push({
        id: (org._id as any).toString(),
        name: org.name,
        domain: org.domain,
        billingPlan: org.billingPlan,
        isActive: org.isActive,
        createdAt: (org as any).createdAt,
        headUser: headUser
          ? {
              id: (headUser._id as any).toString(),
              firstName: headUser.firstName,
              lastName: headUser.lastName,
              email: headUser.email,
              role: headUser.role,
              createdAt: (headUser as any).createdAt,
            }
          : null,
        userCount: users.length,
      });
    }

    return result;
  }

  async updateStatus(
    orgId: string,
    updateData: { isActive?: boolean; billingPlan?: string },
  ): Promise<Organization> {
    const org = await this.orgModel.findByIdAndUpdate(orgId, updateData, { new: true }).exec();
    if (!org) {
      throw new NotFoundException(`Organization with ID ${orgId} not found`);
    }
    return org;
  }
}
