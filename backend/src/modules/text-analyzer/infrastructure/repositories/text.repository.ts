import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TextDocument } from '../schemas/text.schema';
import { Model } from 'mongoose';
import { TextStats } from '../../application/dto/text-stats.dto';

@Injectable()
export class TextRepository {
  constructor(
    @InjectModel(TextDocument.name)
    private textModel: Model<TextDocument>,
  ) {}

  async analyzeText(
    userId: string,
    content: string,
    stats: TextStats,
  ): Promise<TextDocument> {
    const created = await this.textModel.create({
      content,
      userId,
      stats,
    });
    return created;
  }

  async findById(id: string): Promise<TextDocument | null> {
    return this.textModel.findById(id);
  }

  async findAllByUserId(userId: string): Promise<TextDocument[]> {
    return this.textModel.find({ userId });
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.textModel.findByIdAndDelete(id);
    return result !== null;
  }
}
