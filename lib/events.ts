import { prisma } from './prisma'

export type EventType = 'order_created' | 'status_changed' | 'quote_set' | 'payment_received' | 'label_created'

export async function logOrderEvent(orderId: string, type: EventType, description: string) {
  try {
    await prisma.orderEvent.create({ data: { orderId, type, description } })
  } catch (e) {
    console.error('Failed to log order event:', e)
  }
}
