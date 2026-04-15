# 3D Print Shop — Setup Guide

## Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Brevo](https://brevo.com) account (free, formerly Sendinblue)
- A [Shippo](https://goshippo.com) account (free tier)
- A [Vercel](https://vercel.com) account (free) for deployment
- `gh` CLI (already installed)

---

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **anon key** (Settings → API)
3. Also copy the **service_role key** (keep secret!)

### Run Schema
1. In Supabase Dashboard → SQL Editor → New Query
2. Paste the full contents of `supabase/schema.sql`
3. Click **Run**

### Create Storage Bucket
1. Dashboard → Storage → New Bucket
2. Name: `order-files`
3. **Public bucket**: ✅ checked (so uploaded files have public URLs)
4. Add Storage policy — allow authenticated users to upload:
   ```sql
   -- In SQL Editor:
   create policy "Authenticated users can upload"
     on storage.objects for insert
     with check (auth.role() = 'authenticated' and bucket_id = 'order-files');

   create policy "Public read"
     on storage.objects for select
     using (bucket_id = 'order-files');
   ```

### Enable Realtime
1. Dashboard → Database → Replication
2. Under "Supabase Realtime", toggle on the **messages** table

### Make a User Admin
After creating an account via the app, run in SQL Editor:
```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

---

## 2. Brevo Setup

1. Sign up at [brevo.com](https://brevo.com)
2. Go to **Settings → API Keys** → Generate a new key
3. Verify a sender email under **Senders & IP → Senders**

---

## 3. Shippo Setup

1. Sign up at [goshippo.com](https://goshippo.com)
2. Go to **Settings → API** → copy your **Test API token** (start with test, switch to live when ready)

---

## 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=3D Print Shop

SHIPPO_API_KEY=shippo_test_...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 6. Deploy to Vercel

```bash
# Link to Vercel (first time)
npx vercel

# Or via GitHub (recommended):
# 1. Push to GitHub (already done via gh CLI)
# 2. Go to vercel.com → Import Project → select your repo
# 3. Add all environment variables from .env.local
# 4. Deploy

# Update NEXT_PUBLIC_APP_URL to your Vercel URL after first deploy
```

---

## Admin Workflow

1. Sign up normally at `/signup`
2. Run the SQL above to set your account as admin
3. Visit `/admin` to see all orders, update statuses, create shipping labels

## Shipping Flow

1. Admin opens `/admin` → finds an order
2. Changes status dropdown to **shipped**
3. A modal opens → fill in from/to addresses + parcel dimensions
4. Shippo creates the cheapest label automatically
5. Tracking number is saved to the order
6. Customer sees live tracking on their order page

---

## Folder Structure

```
├── app/
│   ├── page.tsx                  # Home page
│   ├── listings/page.tsx         # Public product grid
│   ├── login/page.tsx            # Login
│   ├── signup/page.tsx           # Signup
│   ├── orders/
│   │   ├── page.tsx              # My orders list
│   │   ├── new/page.tsx          # Create order
│   │   └── [id]/page.tsx         # Order detail + chat
│   ├── admin/
│   │   ├── page.tsx              # Admin dashboard
│   │   └── AdminOrderRow.tsx     # Order row with status controls
│   └── api/
│       ├── messages/route.ts     # Send message + email notification
│       ├── upload/route.ts       # File upload to Supabase Storage
│       ├── email/route.ts        # Admin email endpoint
│       ├── orders/status/route.ts # Update order status
│       └── shippo/
│           ├── create-label/route.ts  # Create Shippo label
│           └── track/route.ts         # Live tracking lookup
├── components/
│   ├── Navbar.tsx / NavbarClient.tsx
│   ├── ChatWindow.tsx            # Realtime chat UI
│   ├── MessageBubble.tsx
│   ├── FileUploader.tsx          # Drag & drop upload
│   ├── ProductCard.tsx
│   └── ShippingStatus.tsx        # Live tracking display
├── lib/
│   ├── supabase/client.ts        # Browser Supabase client
│   ├── supabase/server.ts        # Server + service role clients
│   ├── brevo.ts                  # Email via Brevo API
│   └── shippo.ts                 # Shippo REST API wrapper
├── types/index.ts
├── middleware.ts                 # Auth guard + admin check
└── supabase/schema.sql           # Full DB schema + RLS policies
```
