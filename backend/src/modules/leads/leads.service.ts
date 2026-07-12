import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lead, LeadDocument } from './schemas/lead.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';
import { Contact, ContactDocument } from '../contacts/schemas/contact.schema';
import { Deal, DealDocument } from '../deals/schemas/deal.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
    @InjectModel(Deal.name) private dealModel: Model<DealDocument>,
  ) {}

  async create(createLeadDto: CreateLeadDto, organizationId: string, ownerId?: string): Promise<LeadDocument> {
    const newLead = new this.leadModel({
      ...createLeadDto,
      organizationId: new Types.ObjectId(organizationId),
      ownerId: ownerId ? new Types.ObjectId(ownerId) : undefined,
    });
    return newLead.save();
  }

  async findAll(organizationId: string): Promise<LeadDocument[]> {
    return this.leadModel
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .exec();
  }

  async findOne(id: string, organizationId: string): Promise<LeadDocument> {
    const lead = await this.leadModel.findById(id).exec();
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    if (lead.organizationId.toString() !== organizationId) {
      throw new ForbiddenException('Unauthorized tenant access');
    }
    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto, organizationId: string): Promise<LeadDocument> {
    const lead = await this.findOne(id, organizationId);
    Object.assign(lead, updateLeadDto);
    return lead.save();
  }

  async convert(id: string, organizationId: string, userId: string): Promise<any> {
    const lead = await this.findOne(id, organizationId);

    if (lead.status === 'Qualified') {
      throw new ConflictException('Lead has already been converted and qualified');
    }

    // 1. Create Customer (Company)
    const newCustomer = new this.customerModel({
      organizationId: new Types.ObjectId(organizationId),
      name: lead.company,
      phone: lead.phone,
    });
    const customer = await newCustomer.save();

    // 2. Create Contact (Person)
    const newContact = new this.contactModel({
      organizationId: new Types.ObjectId(organizationId),
      customerId: customer._id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      isPrimary: true,
      position: 'Prospect Contact',
    });
    const contact = await newContact.save();

    // 3. Create Deal (Optional, if estimated value is defined)
    let deal: any = null;
    if (lead.estimatedValue && lead.estimatedValue > 0) {
      const newDeal = new this.dealModel({
        organizationId: new Types.ObjectId(organizationId),
        customerId: customer._id,
        ownerId: new Types.ObjectId(userId),
        name: `${lead.company} - Deal`,
        amount: lead.estimatedValue,
        stage: 'Prospecting',
        probability: 10,
      });
      deal = await newDeal.save();
    }

    // 4. Mark Lead as Qualified
    lead.status = 'Qualified';
    await lead.save();

    return {
      customerId: customer._id,
      contactId: contact._id,
      dealId: deal ? deal._id : null,
    };
  }
}
