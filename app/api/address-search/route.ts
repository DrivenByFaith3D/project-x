import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q || q.length < 3) return NextResponse.json([])

  const res = await fetch(
    // bbox restricts to continental US + Alaska/Hawaii roughly
    `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en&countrycodes=us`,
    { headers: { 'User-Agent': 'DrivenByFaith3D/1.0' } }
  )

  if (!res.ok) return NextResponse.json([])

  const data = await res.json()

  const results = (data.features ?? [])
    .map((f: { properties: { housenumber?: string; street?: string; name?: string; city?: string; state?: string; postcode?: string; countrycode?: string } }) => {
      const p = f.properties
      const parts = []
      if (p.housenumber && p.street) parts.push(`${p.housenumber} ${p.street}`)
      else if (p.street) parts.push(p.street)
      else if (p.name) parts.push(p.name)
      if (p.city) parts.push(p.city)
      if (p.state) parts.push(p.state)
      if (p.postcode) parts.push(p.postcode)
      return parts.join(', ')
    })
    .filter((s: string) => s.length > 0)
    // deduplicate
    .filter((s: string, i: number, arr: string[]) => arr.indexOf(s) === i)

  return NextResponse.json(results)
}
