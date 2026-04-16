import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q || q.length < 3) return NextResponse.json([])

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(q)}`,
    { headers: { 'User-Agent': 'DrivenByFaith3D/1.0', 'Accept-Language': 'en' } }
  )

  if (!res.ok) return NextResponse.json([])
  const data = await res.json()
  return NextResponse.json(data)
}
