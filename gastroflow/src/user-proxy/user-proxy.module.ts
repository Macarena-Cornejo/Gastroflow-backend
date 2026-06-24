import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserProxyController } from './user-proxy.controller';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.USER_SERVICE_URL || 'http://localhost:3003',
      timeout: 5000,
    }),
  ],
  controllers: [UserProxyController],
})
export class UserProxyModule {}