import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Simulation extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, lowercase: true })
  description: string;

  @Prop({ required: true, enum: ['Easy', 'Normal', 'Hard', 'Instane'] })
  difficulty: string;

  @Prop({ default: 1, required: true })
  token_count: number;

  @Prop({ required: true, default: 0 })
  minimum_exp: number

  @Prop({ required: true, enum: ['Active', 'Locked'], default: 'Locked' })
  status: string

  @Prop() 
  hint: string[]

  @Prop({ required: true, default: 100 })
  score: number

  @Prop({ required: true, type: Types.ObjectId, ref: "User" })
  createdBy: Types.ObjectId;
}

export const SimulationSchema = SchemaFactory.createForClass(Simulation);