import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({ timestamps: true })
export class Organization {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ unique: true, required: true, lowercase: true, trim: true })
  domain!: string;

  @Prop({
    type: String,
    enum: ['Free', 'Growth', 'Enterprise'],
    default: 'Free',
  })
  billingPlan!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
