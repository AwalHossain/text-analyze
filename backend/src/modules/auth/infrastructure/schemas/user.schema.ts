import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  picture: string;

  @Prop({ required: true })
  provider: string;

  @Prop()
  providerId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
