import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type ChatIntent =
  | 'unknown'
  | 'greeting'
  | 'reservation'
  | 'subscription'
  | 'subscription_payment'
  | 'payment';

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
    const clientData = client.data as { lastIntent?: ChatIntent };

    let intent: ChatIntent = 'unknown';

    // SALUDO
    if (
      message.includes('hola') ||
      message.includes('buenos dias') ||
      message.includes('buenas')
    ) {
      intent = 'greeting';
    }

    // RESERVAS
    if (
      message.includes('reserva') ||
      message.includes('mesa') ||
      message.includes('personas') ||
      message.includes('hora')
    ) {
      intent = 'reservation';
    }

    // SUSCRIPCIONES
    if (
      message.includes('suscripcion') ||
      message.includes('suscripción') ||
      message.includes('plan') ||
      message.includes('renovacion') ||
      message.includes('renovación')
    ) {
      intent = 'subscription';
    }

    // PAGOS
    if (
      message.includes('pago') ||
      message.includes('pagar') ||
      message.includes('factura') ||
      message.includes('cobro')
    ) {
      intent =
        clientData.lastIntent === 'subscription'
          ? 'subscription_payment'
          : 'payment';
    }

    // Guardar contexto
    if (intent !== 'unknown') {
      clientData.lastIntent = intent;
    }

    // RESPUESTAS
    let response =
      'Gracias por escribirnos. Puedo ayudarte con reservas, suscripciones o información de restaurantes.';

    if (intent === 'greeting') {
      response =
        '¡Hola! 👋 Bienvenido a GastroFlow. Puedo ayudarte con reservas, suscripciones o información del restaurante.';
    }

    if (intent === 'reservation') {
      response =
        'Para hacer una reserva, entra a Restaurantes, selecciona uno y elige fecha, hora y número de personas.';
    }

    if (intent === 'subscription') {
      response =
        'Las suscripciones se gestionan desde el panel del restaurante. Allí puedes ver el plan, estado y fecha de renovación.';
    }

    if (intent === 'subscription_payment') {
      response =
        'Puedes pagar o renovar tu suscripción desde el panel de administrador, en la sección de suscripciones o pagos.';
    }

    if (intent === 'payment') {
      response =
        'Los pagos disponibles dependen del módulo que estés usando: reservas o suscripciones. ¿Te refieres a una reserva o a una suscripción?';
    }

    client.emit('chat:message', {
      message: response,
      sender: 'bot',
    });
  }
}
