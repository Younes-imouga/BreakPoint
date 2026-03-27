import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { AttemptsService } from '../attempts/attempts.service';

@Injectable()
export class AttemptsOwnerGuard implements CanActivate {
  constructor(private readonly attemptsService: AttemptsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Expect attempt id in URL params (common pattern for these routes)
    const attemptId =
      request.params?.id ?? request.body?.attemptId ?? request.body?.id;

    if (!attemptId) {
      throw new ForbiddenException('Missing attempt id for ownership check');
    }

    const attempt = await this.attemptsService.getAttemptById(attemptId);
    const ownerId = attempt.user_id?.toString?.() ?? attempt.user_id;

    const role = (user.role ?? '').toString().toLowerCase();

    if (ownerId === (user.id ?? user.userId ?? user.user_id)) return true;
    if (role === 'admin' || role === 'administrator') return true;

    throw new ForbiddenException('You do not own this attempt');
  }
}
