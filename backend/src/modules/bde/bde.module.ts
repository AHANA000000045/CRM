import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BdeService } from './bde.service';
import { BdeController } from './bde.controller';
import { Deal, DealSchema } from '../deals/schemas/deal.schema';
import { Lead, LeadSchema } from '../leads/schemas/lead.schema';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Deal.name, schema: DealSchema },
      { name: Lead.name, schema: LeadSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [BdeController],
  providers: [BdeService],
  exports: [BdeService],
})
export class BdeModule {}
