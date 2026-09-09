import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError, of } from 'rxjs';

@Injectable()
export class AuditService {
    constructor(private readonly httpService: HttpService) { }

    async registrarAccion(accion: string, usuario: string, detalle?: string) {
        // Fire and forget — no bloqueamos el flujo principal si el servicio está caído
        firstValueFrom(
            this.httpService.post('/saludos', {
                mensaje: `[AUDIT] ${accion} por ${usuario}: ${detalle ?? ''}`,
                autor: 'gastroflow',
            }).pipe(
                catchError((err) => {
                    console.warn('express-service no disponible, log perdido:', err.message);
                    return of(null);
                })
            )
        );
    }
}