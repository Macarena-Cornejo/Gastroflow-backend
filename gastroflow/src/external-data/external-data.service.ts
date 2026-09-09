import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class ExternalDataService {
    constructor(private readonly httpService: HttpService) { }

    async obtenerSaludos() {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get('/saludos')
            );
            return data;
        } catch (error) {
            if ((error as AxiosError).code === 'ECONNREFUSED') {
                throw new ServiceUnavailableException('axios-service no disponible');
            }
            throw error;
        }
    }

    async obtenerChiste() {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get('/chiste')
            );
            return data;
        } catch (error) {
            throw new ServiceUnavailableException('axios-service no disponible');
        }
    }
}
