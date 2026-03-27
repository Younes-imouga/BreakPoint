import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Simulation extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: false, trim: true, select: false })
  token?: string;

  @Prop({ required: true, lowercase: true })
  description: string;

  @Prop({ required: true, enum: ['Easy', 'Normal', 'Hard', 'Insane'] })
  difficulty: string;

  @Prop({ default: 1, required: true })
  token_count: number;

  @Prop({ required: true, default: 0 })
  minimum_exp: number;

  @Prop({ required: true, enum: ['Active', 'Locked'], default: 'Locked' })
  status: string;

  @Prop()
  hint: string[];

  @Prop({ required: true, default: 100 })
  score: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({
    type: [
      {
        fileName: { type: String, required: true },
        language: { type: String, default: 'html' },
        content: { type: String, required: true },
      },
    ],
    default: [],
  })
  components: Array<{
    fileName: string;
    language: string;
    content: string;
  }>;
}

export const SimulationSchema = SchemaFactory.createForClass(Simulation);
