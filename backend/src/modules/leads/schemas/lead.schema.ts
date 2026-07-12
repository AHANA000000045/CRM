import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Organization } from '../../organizations/schemas/organization.schema';
import { User } from '../../users/schemas/user.schema';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId | Organization;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  ownerId?: Types.ObjectId | User;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ required: true, trim: true })
  company!: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Unqualified', 'Lost'],
    default: 'New',
  })
  status!: string;

  @Prop({
    type: String,
    enum: ['Website', 'Referral', 'Cold Call', 'Social Media', 'Other'],
    default: 'Other',
  })
  source!: string;

  @Prop({ type: Number, default: 0 })
  estimatedValue!: number;

  @Prop({ trim: true })
  notes?: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

LeadSchema.index({ organizationId: 1, status: 1 });
LeadSchema.index({ organizationId: 1, email: 1 });
