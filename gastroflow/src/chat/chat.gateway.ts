import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('chat:message')
  handleChatMessage(
    @MessageBody() data: { message: string; sender: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Mensaje recibido:', data);

    const message = data.message.toLowerCase();

    let response =
      'Gracias por escribirnos. Puedo ayudarte con reservas, suscripciones o información de restaurantes.';

    // SUSCRIPCIONES
    if (
      message.includes('suscrib') ||
      message.includes('pago') ||
      message.includes('renov') ||
      message.includes('plan')
    ) {
      response =
        'Puedes gestionar el pago de tu suscripción desde el panel de administrador en la sección de suscripciones. Allí verás tu estado y fecha de renovación.';
    }

    // RESERVAS
    else if (message.includes('reserva') || message.includes('mesa')) {
      response =
        'Para hacer una reserva, entra a Restaurantes, selecciona uno y elige fecha, hora y número de personas.';
    }

    client.emit('chat:message', {
      message: response,
      sender: 'bot',
    });
  }
}
