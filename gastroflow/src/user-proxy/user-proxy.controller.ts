import {
  Controller, All, Req, Res, Param,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller()
export class UserProxyController {
  constructor(private readonly httpService: HttpService) {}

  private normalizeProxyPath(path: string | string[] | undefined): string {
    if (!path) return '';
    return Array.isArray(path) ? path.join('/') : path;
  }

  // Proxy: /users/* → user-service
  @All('users/*path')
  async proxyUsers(
    @Param('path') path: string | string[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const proxyPath = this.normalizeProxyPath(path);
    const url = proxyPath ? `/users/${proxyPath}` : '/users';
    const headers = { ...req.headers, host: undefined };

    const response = await firstValueFrom(
      this.httpService.request({
        method: req.method as any,
        url,
        data: req.body,
        headers,
        params: req.query,
      }),
    );

    res.status(response.status).json(response.data);
  }

  // Proxy: /auth/* → user-service
  @All('auth/*path')
  async proxyAuth(
    @Param('path') path: string | string[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const proxyPath = this.normalizeProxyPath(path);
    const url = proxyPath ? `/auth/${proxyPath}` : '/auth';
    const headers = { ...req.headers, host: undefined };

    const response = await firstValueFrom(
      this.httpService.request({
        method: req.method as any,
        url,
        data: req.body,
        headers,
        params: req.query,
      }),
    );

    res.status(response.status).json(response.data);
  }
}