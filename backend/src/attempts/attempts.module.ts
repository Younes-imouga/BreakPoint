import { Module, forwardRef } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Attempt, AttemptSchema } from './schemas/attempt.schema';
import { AttemptsOwnerGuard } from '../guards/attempts-owner.guard';
import { Simulation, SimulationSchema } from '../simulations/schemas/simulation.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attempt.name, schema: AttemptSchema },
      { name: Simulation.name, schema: SimulationSchema },
    ]),
    forwardRef(() => UsersModule),
  ],
  providers: [AttemptsService, AttemptsOwnerGuard],
  controllers: [AttemptsController],
  exports: [AttemptsService],
})
export class AttemptsModule {}
