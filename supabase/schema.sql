-- ============================================================
-- 3D Print Shop - Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (auto-created for every auth user via trigger)
create table if not exists public.profiles (
  id       uuid references auth.users on delete cascade primary key,
  email    text,
  role     text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

-- Products (public catalog)
create table if not exists public.products (
  id          uuid default uuid_generate_v4() primary key,
  name        text not null,
  description text,
  price       numeric(10, 2) not null check (price >= 0),
  image_url   text,
  created_at  timestamptz default now()
);

-- Orders
create table if not exists public.orders (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid references auth.users on delete cascade not null,
  status           text not null default 'pending'
                     check (status in ('pending', 'in_progress', 'completed', 'shipped')),
  description      text not null default '',
  tracking_number  text,
  carrier          text,
  tracking_status  text,
  tracking_url     text,
  created_at       timestamptz default now()
);

-- Messages
create table if not exists public.messages (
  id         uuid default uuid_generate_v4() primary key,
  order_id   uuid references public.orders on delete cascade not null,
  sender_id  uuid references auth.users on delete cascade not null,
  content    text not null,
  file_url   text,
  created_at timestamptz default now()
);

-- File uploads
create table if not exists public.file_uploads (
  id         uuid default uuid_generate_v4() primary key,
  order_id   uuid references public.orders on delete cascade not null,
  url        text not null,
  name       text,
  created_at timestamptz default now()
);

-- ============================================================
-- TRIGGER: Create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- HELPER: Check if current user is admin
-- ============================================================
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.messages    enable row level security;
alter table public.file_uploads enable row level security;

-- ---- Profiles ----
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- ---- Products (public read) ----
create policy "products_select" on public.products
  for select using (true);

create policy "products_admin_all" on public.products
  for all using (public.is_admin());

-- ---- Orders ----
create policy "orders_select" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

create policy "orders_insert" on public.orders
  for insert with check (auth.uid() = user_id);

create policy "orders_update" on public.orders
  for update using (public.is_admin());

-- ---- Messages ----
create policy "messages_select" on public.messages
  for select using (
    public.is_admin() or
    exists (
      select 1 from public.orders
      where orders.id = messages.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "messages_insert" on public.messages
  for insert with check (
    auth.uid() = sender_id and (
      public.is_admin() or
      exists (
        select 1 from public.orders
        where orders.id = messages.order_id
          and orders.user_id = auth.uid()
      )
    )
  );

-- ---- File uploads ----
create policy "file_uploads_select" on public.file_uploads
  for select using (
    public.is_admin() or
    exists (
      select 1 from public.orders
      where orders.id = file_uploads.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "file_uploads_insert" on public.file_uploads
  for insert with check (
    public.is_admin() or
    exists (
      select 1 from public.orders
      where orders.id = file_uploads.order_id
        and orders.user_id = auth.uid()
    )
  );

-- ============================================================
-- REALTIME: Enable for messages table
-- ============================================================
alter publication supabase_realtime add table public.messages;

-- ============================================================
-- SAMPLE PRODUCTS (optional seed data)
-- ============================================================
insert into public.products (name, description, price) values
  ('Custom Phone Stand', 'Ergonomic desktop phone holder. Choose your color.', 12.99),
  ('Architectural Scale Model', 'High-detail scale models for architecture presentations.', 89.00),
  ('Gear Prototype', 'Functional gear prototype in PLA or PETG.', 24.50)
on conflict do nothing;
