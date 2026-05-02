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

    if (message.includes('suscrib')) {
      response =
        'Para suscribirte, haz clic en “Registra tu negocio” y completa el formulario. Luego podrás elegir un plan.';
    }

    if (message.includes('reserva')) {
      response =
        'Para hacer una reserva, entra a Restaurantes, elige uno, selecciona mesa, fecha y confirma.';
    }

    client.emit('chat:message', {
      message: response,
      sender: 'bot',
    });
  }
}
