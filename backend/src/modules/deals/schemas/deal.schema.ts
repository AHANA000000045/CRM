import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Organization } from '../../organizations/schemas/organization.schema';
import { Customer } from '../../customers/schemas/customer.schema';
import { User } from '../../users/schemas/user.schema';

export type DealDocument = Deal & Document;

@Schema({ timestamps: true })
export class Deal {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId | Organization;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId!: Types.ObjectId | Customer;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId | User;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({
    type: String,
    enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'Prospecting',
  })
  stage!: string;

  @Prop({ type: Number, default: 10 })
  probability!: number;

  @Prop({ type: Date })
  expectedCloseDate?: Date;
}

export const DealSchema = SchemaFactory.createForClass(Deal);

DealSchema.index({ organizationId: 1, stage: 1 });
