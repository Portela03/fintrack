"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const domain_errors_1 = require("../domain/domain-errors");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (status >= 500) {
                this.logger.error(`[${request.method}] ${request.url} → ${status}`, exception instanceof Error ? exception.stack : String(exception));
            }
            response.status(status).json(typeof exceptionResponse === 'object'
                ? exceptionResponse
                : { message: exceptionResponse, statusCode: status });
            return;
        }
        if (exception instanceof domain_errors_1.DomainError) {
            response.status(common_1.HttpStatus.UNPROCESSABLE_ENTITY).json({
                statusCode: common_1.HttpStatus.UNPROCESSABLE_ENTITY,
                error: exception.name,
                message: exception.message,
            });
            return;
        }
        this.logger.error(`[${request.method}] ${request.url} → 500 Unhandled exception`, exception instanceof Error ? exception.stack : String(exception));
        const message = exception instanceof Error ? exception.message : 'Internal server error';
        response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            message,
        });
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map