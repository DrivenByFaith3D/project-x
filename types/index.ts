export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'shipped'

export interface Profile {
  id: string
  email: string
  role: 'user' | 'admin'
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  description: string
  tracking_number: string | null
  carrier: string | null
  tracking_status: string | null
  tracking_url: string | null
  created_at: string
  profiles?: Profile
}

export interface Message {
  id: string
  order_id: string
  sender_id: string
  content: string
  file_url: string | null
  created_at: string
  profiles?: Profile
}

export interface FileUpload {
  id: string
  order_id: string
  url: string
  name: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  created_at: string
}

export interface TrackingInfo {
  carrier: string
  tracking_number: string
  status: string
  eta: string | null
  tracking_url: string | null
  tracking_history: TrackingEvent[]
}

export interface TrackingEvent {
  status: string
  status_date: string
  location: string
  description: string
}
