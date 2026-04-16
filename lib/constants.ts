export const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-zinc-800 text-zinc-300',
  in_progress: 'bg-zinc-700 text-white',
  completed: 'bg-white text-black',
  shipped: 'bg-zinc-300 text-black',
}

export const formatOrderId = (order: { id: string; orderNumber?: string | null }) =>
  order.orderNumber ?? `#${order.id.slice(0, 8).toUpperCase()}`

export const ALLOWED_FILE_EXTENSIONS = ['stl', 'png', 'jpg', 'jpeg', 'gif', 'webp']
