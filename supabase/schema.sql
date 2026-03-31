-- ============================================================
-- ShopCo Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── Tables ──────────────────────────────────────────────────────────────────

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  first_name   text,
  last_name    text,
  email        text unique not null,
  phone        text,
  role         text not null default 'customer'
               check (role in ('customer', 'vendor')),
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Products
create table if not exists products (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  price       numeric(10,2) not null check (price >= 0),
  quantity    integer not null default 0 check (quantity >= 0),
  images      text[] not null default '{}',
  category    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Orders
create table if not exists orders (
  id               uuid primary key default uuid_generate_v4(),
  customer_id      uuid references profiles(id) on delete set null,
  status           text not null default 'pending'
                   check (status in ('pending','paid','shipped','delivered','cancelled')),
  total            numeric(10,2) not null check (total >= 0),
  paypal_order_id  text,
  paypal_capture_id text,
  shipping_address jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Order Items
create table if not exists order_items (
  id                 uuid primary key default uuid_generate_v4(),
  order_id           uuid not null references orders(id) on delete cascade,
  product_id         uuid references products(id) on delete set null,
  quantity           integer not null check (quantity > 0),
  price_at_purchase  numeric(10,2) not null check (price_at_purchase >= 0),
  product_title      text not null
);

-- Conversations
create table if not exists conversations (
  id              uuid primary key default uuid_generate_v4(),
  customer_id     uuid not null references profiles(id) on delete cascade,
  subject         text,
  last_message_at timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

-- Messages
create table if not exists messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid references profiles(id) on delete set null,
  content         text not null,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);


-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index if not exists idx_products_is_active on products(is_active);
create index if not exists idx_products_category on products(category);
create index if not exists idx_orders_customer_id on orders(customer_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_conversations_customer_id on conversations(customer_id);
create index if not exists idx_messages_conversation_id on messages(conversation_id);


-- ─── Auto-update updated_at trigger ─────────────────────────────────────────

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at_column();

create or replace trigger trg_products_updated_at
  before update on products
  for each row execute function update_updated_at_column();

create or replace trigger trg_orders_updated_at
  before update on orders
  for each row execute function update_updated_at_column();


-- ─── Auto-create profile on auth signup ──────────────────────────────────────

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do update set
    first_name = coalesce(excluded.first_name, profiles.first_name),
    last_name  = coalesce(excluded.last_name,  profiles.last_name),
    phone      = coalesce(excluded.phone,      profiles.phone),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table profiles     enable row level security;
alter table products     enable row level security;
alter table orders       enable row level security;
alter table order_items  enable row level security;
alter table conversations enable row level security;
alter table messages     enable row level security;


-- Helper: check if the current user is a vendor
create or replace function is_vendor()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'vendor'
  );
$$ language sql security definer stable;


-- ── Profiles ──
-- Users can read and update only their own profile
create policy "profiles_own_select" on profiles
  for select using (auth.uid() = id);

create policy "profiles_own_update" on profiles
  for update using (auth.uid() = id);

create policy "profiles_own_insert" on profiles
  for insert with check (auth.uid() = id);

-- Vendor can read all profiles (for order customer info)
create policy "profiles_vendor_select" on profiles
  for select using (is_vendor());


-- ── Products ──
-- Anyone (including anonymous) can read active products
create policy "products_public_read" on products
  for select using (is_active = true);

-- Vendor can read ALL products (including inactive)
create policy "products_vendor_read" on products
  for select using (is_vendor());

-- Only vendor can insert / update / delete
create policy "products_vendor_insert" on products
  for insert with check (is_vendor());

create policy "products_vendor_update" on products
  for update using (is_vendor());

create policy "products_vendor_delete" on products
  for delete using (is_vendor());


-- ── Orders ──
-- Customers can read and insert their own orders
create policy "orders_customer_select" on orders
  for select using (customer_id = auth.uid());

create policy "orders_customer_insert" on orders
  for insert with check (customer_id = auth.uid());

-- Vendor can read and update all orders
create policy "orders_vendor_select" on orders
  for select using (is_vendor());

create policy "orders_vendor_update" on orders
  for update using (is_vendor());


-- ── Order Items ──
-- Customers can read items belonging to their orders
create policy "order_items_customer_select" on order_items
  for select using (
    exists (
      select 1 from orders
      where id = order_id and customer_id = auth.uid()
    )
  );

-- NOTE: order_items are created by the Netlify Function using the service role key,
-- so no customer INSERT policy is needed here (service role bypasses RLS).

-- Vendor can read all order items
create policy "order_items_vendor_select" on order_items
  for select using (is_vendor());


-- ── Conversations ──
-- Customers manage their own conversations
create policy "conversations_customer_all" on conversations
  for all using (customer_id = auth.uid());

-- Vendor can read and update all conversations
create policy "conversations_vendor_select" on conversations
  for select using (is_vendor());

create policy "conversations_vendor_update" on conversations
  for update using (is_vendor());


-- ── Messages ──
-- Users can read messages in conversations they are part of
create policy "messages_participant_select" on messages
  for select using (
    -- Sender
    sender_id = auth.uid()
    or
    -- Part of the conversation (customer)
    exists (
      select 1 from conversations c
      where c.id = conversation_id and c.customer_id = auth.uid()
    )
    or
    -- Vendor
    is_vendor()
  );

-- Anyone authenticated can insert messages where they are the sender
create policy "messages_insert" on messages
  for insert with check (sender_id = auth.uid());


-- ─── Storage: product-images bucket ──────────────────────────────────────────
-- Run this AFTER creating the bucket manually in Supabase dashboard:
-- Storage → New bucket → Name: "product-images" → Public: ON

-- Allow the vendor to upload/delete images
-- (Configure this in Supabase dashboard → Storage → product-images → Policies)


-- ─── Initial Vendor Setup ────────────────────────────────────────────────────
-- After the vendor registers through the app, promote their account to vendor:
--
-- UPDATE profiles
--   SET role = 'vendor'
--   WHERE email = 'your-vendor-email@example.com';
--
-- Run this once in the Supabase SQL Editor after the vendor account is created.
-- ─────────────────────────────────────────────────────────────────────────────
