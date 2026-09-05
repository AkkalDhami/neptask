import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

import { ApiResponse, ApiSuccessResponse } from "@/shared/interfaces"
import { Response } from "express"

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  ApiResponse<T>,
  ApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<ApiResponse<T>>
  ): Observable<ApiSuccessResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>()

    return next.handle().pipe(
      map(({ data, message = "Success" }) => ({
        success: true,
        statusCode: response.statusCode,
        message,
        data,
        timestamp: new Date().toISOString(),
      }))
    )
  }
}
