import { Module } from '@nestjs/common';
import { SimulationsService } from './simulations.service';
import { SimulationsController } from './simulations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Simulation, SimulationSchema } from './schemas/simulation.schema';
import { Attempt, AttemptSchema } from '../attempts/schemas/attempt.schema';
import { AttemptsModule } from '../attempts/attempts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Simulation.name, schema: SimulationSchema },
      { name: Attempt.name, schema: AttemptSchema },
    ]),
    AttemptsModule,
  ],
  providers: [SimulationsService],
  controllers: [SimulationsController],
  exports: [SimulationsService],
})
export class SimulationsModule {}
