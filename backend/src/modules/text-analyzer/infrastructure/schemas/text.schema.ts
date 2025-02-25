import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TextDocument extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: false })
  userId: string;

  @Prop({ required: false })
  man: string;

  @Prop({ type: Object, required: true })
  stats: {
    wordCount: number;
    characterCount: number;
    sentenceCount: number;
    paragraphCount: number;
    longestWords: string[];
  };
}

export const TextSchema = SchemaFactory.createForClass(TextDocument);
