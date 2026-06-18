import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      user?: { id: number };
    }>();
    const { method, url } = req;
    const userId = req.user?.id;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<{ statusCode: number }>();
          const durationMs = Date.now() - start;
          const statusCode = res.statusCode;

          this.prisma.systemLog
            .create({
              data: { level: 'info', method, url, statusCode, durationMs, userId },
            })
            .catch(() => {});
        },
        error: (err: { status?: number }) => {
          const durationMs = Date.now() - start;
          const statusCode = err?.status ?? 500;

          this.prisma.systemLog
            .create({
              data: { level: 'error', method, url, statusCode, durationMs, userId },
            })
            .catch(() => {});
        },
      }),
    );
  }
}
