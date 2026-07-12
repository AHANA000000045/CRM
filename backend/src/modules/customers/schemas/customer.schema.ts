import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Organization } from '../../organizations/schemas/organization.schema';

export type CustomerDocument = Customer & Document;

@Schema({ _id: false })
export class Address {
  @Prop({ trim: true })
  street?: string;

  @Prop({ trim: true })
  city?: string;

  @Prop({ trim: true })
  state?: string;

  @Prop({ trim: true })
  zipCode?: string;

  @Prop({ trim: true })
  country?: string;
}

@Schema({ timestamps: true })
export class Customer {
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId!: Types.ObjectId | Organization;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  industry?: string;

  @Prop({ trim: true })
  website?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ type: Address })
  address?: Address;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.index({ organizationId: 1, name: 1 });
