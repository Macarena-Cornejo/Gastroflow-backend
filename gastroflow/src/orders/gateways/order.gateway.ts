import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  restaurantId?: string;
  roles?: string[];
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  },
})
@Injectable()
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

  handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token;

      if (!token) {
        console.log('Cliente desconectado: sin token');
        client.disconnect();
        return;
      }

      const decoded = jwt.verify(token, this.jwtSecret) as any;

      client.userId = decoded.id;
      client.restaurantId = decoded.restaurant_id;
      client.roles = decoded.roles || [];

      // Todos se unen a la sala del restaurante (fuente única de eventos)
      const restaurantRoom = `restaurant-${client.restaurantId}`;
      client.join(restaurantRoom);

      console.log(
        `[WS] Conectado: ${client.userId} | Restaurante: ${client.restaurantId} | Roles: ${(client.roles || []).join(', ')}`,
      );
    } catch (error) {
      console.error('[WS] Error en conexión:', error instanceof Error ? error.message : error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`[WS] Desconectado: ${client.userId}`);
  }

  emitToRestaurant(restaurantId: string, event: string, payload: any) {
    const room = `restaurant-${restaurantId}`;
    this.server.to(room).emit(event, payload);
  }
}

