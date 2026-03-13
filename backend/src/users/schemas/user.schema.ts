import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'PARTICIPANT', enum: ['ADMIN', 'PARTICIPANT'] })
  role: string;

  @Prop({ default: 0 })
  exp: number;

  @Prop({ default: 0 })
  total_score: number;

  @Prop({ type: [Types.ObjectId], ref: 'Simulation', default: [] })
  completed_simulations: Types.ObjectId[];

  @Prop({ default: 'BEGINNER', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'] })
  badge: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
