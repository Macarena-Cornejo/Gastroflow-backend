import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuditService } from './audit.service';

@Module({
    imports: [
        HttpModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                baseURL: config.get('services.expressService'),
                timeout: 3000,
            }),
        }),
    ],
    providers: [AuditService],
    exports: [AuditService],
})
export class AuditModule { }