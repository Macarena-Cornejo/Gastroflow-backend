import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExternalDataService } from './external-data.service';
import { ExternalDataController } from './external-data.controller';

@Module({
    imports: [
        HttpModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                baseURL: config.get('services.axiosService'),
                timeout: 5000,
            }),
        }),
    ],
    providers: [ExternalDataService],
    controllers: [ExternalDataController],
})
export class ExternalDataModule { }