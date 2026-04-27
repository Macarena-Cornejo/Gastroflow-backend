export enum OrderStatus {
  PENDING = 'pending',      // Mozo acaba de crear la orden
  COOKING = 'cooking',      // Orden enviada a cocina
  READY = 'ready',          // Cocina notifica que está lista
  CLOSED = 'closed',        // Mozo envía a caja para cobrar
}
