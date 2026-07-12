import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Deal, DealDocument } from './schemas/deal.schema';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Injectable()
export class DealsService {
  constructor(@InjectModel(Deal.name) private dealModel: Model<DealDocument>) {}

  private getProbabilityForStage(stage: string): number {
    switch (stage) {
      case 'Prospecting': return 10;
      case 'Qualification': return 20;
      case 'Proposal': return 50;
      case 'Negotiation': return 80;
      case 'Closed Won': return 100;
      case 'Closed Lost': return 0;
      default: return 10;
    }
  }

  async create(createDealDto: CreateDealDto, organizationId: string, ownerId: string): Promise<DealDocument> {
    const probability = createDealDto.probability ?? this.getProbabilityForStage(createDealDto.stage || 'Prospecting');
    
    const newDeal = new this.dealModel({
      ...createDealDto,
      organizationId: new Types.ObjectId(organizationId),
      ownerId: new Types.ObjectId(ownerId),
      customerId: new Types.ObjectId(createDealDto.customerId),
      probability,
    });
    return newDeal.save();
  }

  async findAll(organizationId: string): Promise<DealDocument[]> {
    return this.dealModel
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .populate('customerId', 'name')
      .populate('ownerId', 'firstName lastName')
      .exec();
  }

  async findOne(id: string, organizationId: string): Promise<DealDocument> {
    const deal = await this.dealModel.findById(id).exec();
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }
    if (deal.organizationId.toString() !== organizationId) {
      throw new ForbiddenException('Unauthorized tenant access');
    }
    return deal;
  }

  async update(id: string, updateDealDto: UpdateDealDto, organizationId: string): Promise<DealDocument> {
    const deal = await this.findOne(id, organizationId);
    
    if (updateDealDto.stage && !updateDealDto.probability) {
      deal.probability = this.getProbabilityForStage(updateDealDto.stage);
    }

    Object.assign(deal, updateDealDto);
    return deal.save();
  }
}
