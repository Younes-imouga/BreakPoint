import { CallHandler, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { NestInterceptor } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Observable, tap } from "rxjs";
import { Logger } from "winston";



@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        const { method, url } = request;

        const user = request.user ?? "unAuthenticated";
        const startTime = Date.now();
        const action = url;
        let username = "unAuthenticated";

        if (user !== "unAuthenticated") {
            username = user.username ?? user.email;
        }

        return next.handle().pipe(
            tap(
                () => {
                    const statusCode = response.statusCode;
                    const duration = Date.now() - startTime;

                    this.logger.info(
                        `method: ${method} - action: ${action} - status: ${statusCode} - ${duration}ms - User: ${username}`
                    )
                }
            )
        )
    }
}