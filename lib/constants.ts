export const STATUS_STYLES: Record<string, string> = {
  pending:          'bg-zinc-800 text-zinc-300',
  in_progress:      'bg-blue-900/60 text-blue-300',
  label_created:    'bg-yellow-900/60 text-yellow-300',
  in_transit:       'bg-orange-900/60 text-orange-300',
  out_for_delivery: 'bg-purple-900/60 text-purple-300',
  delivered:        'bg-green-900/60 text-green-300',
  cancelled:        'bg-red-900/60 text-red-300',
}

export const STATUS_LABELS: Record<string, string> = {
  pending:          'Pending',
  in_progress:      'In Progress',
  label_created:    'Label Made',
  in_transit:       'In Transit',
  out_for_delivery: 'Shipped',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
}

// Maps Shippo tracking statuses → our order statuses
export const SHIPPO_STATUS_MAP: Record<string, string> = {
  PRE_TRANSIT:      'label_created',
  TRANSIT:          'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED:        'delivered',
}

export const formatOrderId = (order: { id: string; orderNumber?: string | null }) =>
  order.orderNumber ?? `#${order.id.slice(0, 8).toUpperCase()}`

export const ALLOWED_FILE_EXTENSIONS = ['stl', 'png', 'jpg', 'jpeg', 'gif', 'webp']
