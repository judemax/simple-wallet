import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus} from "@nestjs/common";
import {AssertionError} from "../../utils/assertion";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const status: number = exception instanceof HttpException
            ? exception.getStatus()
            : HttpStatus.BAD_REQUEST;

        const message: string | object = exception instanceof HttpException
            ? exception.getResponse()
            : exception instanceof AssertionError
                ? exception.message
                : "Server error";

        host.switchToHttp().getResponse().status(status).send({
            statusCode: status,
            ts: Date.now(),
            message,
            code: exception instanceof AssertionError ? exception.code : undefined,
        });
    }
}
