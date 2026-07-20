"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const success_response_interceptor_1 = require("./common/interceptors/success-response.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const webAppUrl = configService.getOrThrow('WEB_APP_URL');
    app.use((0, helmet_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new success_response_interceptor_1.SuccessResponseInterceptor());
    app.useStaticAssets((0, node_path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });
    app.setGlobalPrefix('api');
    const openApiDocument = swagger_1.SwaggerModule.createDocument(app, new swagger_1.DocumentBuilder()
        .setTitle('DNA API')
        .setDescription('DNA marketplace API')
        .setVersion('1.0')
        .addBearerAuth()
        .build());
    swagger_1.SwaggerModule.setup('api/docs', app, openApiDocument);
    app.enableCors({
        origin: webAppUrl,
    });
    await app.listen(configService.getOrThrow('PORT'), '0.0.0.0');
}
void bootstrap();
//# sourceMappingURL=main.js.map