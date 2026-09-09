import { Controller, Get, UseGuards } from '@nestjs/common';
import { ExternalDataService } from './external-data.service';
import { AuthGuard as JwtAuthGuard } from '../auth/guards/Auth.guard';

@Controller('external')
@UseGuards(JwtAuthGuard)
export class ExternalDataController {
    constructor(private readonly service: ExternalDataService) { }

    @Get('saludos')
    obtenerSaludos() {
        return this.service.obtenerSaludos();
    }

    @Get('chiste')
    obtenerChiste() {
        return this.service.obtenerChiste();
    }
}