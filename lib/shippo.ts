const SHIPPO_BASE = 'https://api.goshippo.com'

function shippoHeaders() {
  return {
    Authorization: `ShippoToken ${process.env.SHIPPO_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

export interface ShippoAddress {
  name: string
  street1: string
  city: string
  state: string
  zip: string
  country: string
  email?: string
  phone?: string
}

export interface ShippoParcel {
  length: string
  width: string
  height: string
  distance_unit: 'in' | 'cm'
  weight: string
  mass_unit: 'lb' | 'kg'
}

export async function createShipment(
  addressFrom: ShippoAddress,
  addressTo: ShippoAddress,
  parcel: ShippoParcel
) {
  const res = await fetch(`${SHIPPO_BASE}/shipments/`, {
    method: 'POST',
    headers: shippoHeaders(),
    body: JSON.stringify({
      address_from: addressFrom,
      address_to: addressTo,
      parcels: [parcel],
      async: false,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shippo create shipment error: ${err}`)
  }

  return res.json()
}

export async function purchaseLabel(rateId: string) {
  const res = await fetch(`${SHIPPO_BASE}/transactions/`, {
    method: 'POST',
    headers: shippoHeaders(),
    body: JSON.stringify({
      rate: rateId,
      label_file_type: 'PDF',
      async: false,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shippo purchase label error: ${err}`)
  }

  return res.json()
}

export async function getTrackingStatus(carrier: string, trackingNumber: string) {
  const res = await fetch(
    `${SHIPPO_BASE}/tracks/${carrier}/${trackingNumber}`,
    { headers: shippoHeaders() }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shippo tracking error: ${err}`)
  }

  return res.json()
}
