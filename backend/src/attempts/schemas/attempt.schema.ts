import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttemptDocument = Attempt & Document;

@Schema({ _id: false })
export class AttemptComponentSnapshot {
  @Prop({ type: String, required: true })
  fileName: string;

  @Prop({ type: String, default: 'html' })
  language: string;

  @Prop({ type: String, required: true })
  content: string;
}

export const AttemptComponentSnapshotSchema =
  SchemaFactory.createForClass(AttemptComponentSnapshot);

@Schema({ timestamps: true })
export class Attempt extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Simulation' })
  simulation_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ type: [String], default: [] })
  attempts: string[];

  @Prop({ default: 0 })
  hints_used: number;

  @Prop({ type: Boolean, default: null })
  success: boolean | null;

  @Prop({ type: Number, default: null })
  final_score: number | null;

  @Prop({
    type: AttemptComponentSnapshotSchema,
    required: false,
  })
  component?: AttemptComponentSnapshot;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
