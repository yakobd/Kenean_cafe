-- ============================================================
-- ከነአን Café — Initial Schema Migration
-- ============================================================

-- ─── Extensions ────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ─────────────────────────────────────────────────
create type user_role as enum (
  'customer', 'waiter', 'cashier', 'admin', 'super-admin'
);

create type order_status as enum (
  'pending',
  'preparing',
  'served',
  'bill-waiter-review',
  'bill-cashier-review',
  'awaiting-payment',
  'payment-submitted',
  'payment-waiter-verified',
  'payment-confirmed',
  'completed',
  'rejected'
);

create type payment_method as enum ('cash', 'bank-transfer');

create type expense_status as enum ('pending', 'approved', 'rejected');

-- ============================================================
-- 1. profiles
-- ============================================================
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- 2. categories
-- ============================================================
create table categories (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  name_amharic  text,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 3. menu_items
-- ============================================================
create table menu_items (
  id            uuid primary key default uuid_generate_v4(),
  category_id   uuid references categories(id) on delete set null,
  name          text not null,
  name_amharic  text,
  description   text,
  price         numeric(10, 2) not null check (price >= 0),
  image_url     text,
  is_available  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- 4. inventory_items
-- ============================================================
create table inventory_items (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  name_amharic        text,
  category            text,
  quantity            numeric(12, 3) not null default 0 check (quantity >= 0),
  unit                text not null,
  unit_price          numeric(10, 2) not null default 0 check (unit_price >= 0),
  low_stock_threshold numeric(12, 3) not null default 0 check (low_stock_threshold >= 0),
  last_updated        timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

-- ============================================================
-- 5. orders
-- ============================================================
create table orders (
  id                   uuid primary key default uuid_generate_v4(),
  customer_id          uuid references auth.users(id) on delete set null,
  customer_name        text not null,
  table_number         int not null,
  status               order_status not null default 'pending',
  total                numeric(10, 2) not null check (total >= 0),
  payment_method       payment_method not null,
  special_instructions text,
  rejection_reason     text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Keep updated_at current on any row change
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at before update on orders
  for each row execute procedure set_updated_at();

-- ============================================================
-- 6. order_items
-- ============================================================
create table order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  name         text not null,   -- price snapshot at time of order
  price        numeric(10, 2) not null,
  quantity     int not null check (quantity > 0)
);

-- ============================================================
-- 7. transactions
-- ============================================================
create table transactions (
  id             uuid primary key default uuid_generate_v4(),
  order_id       uuid not null references orders(id) on delete cascade,
  amount         numeric(10, 2) not null check (amount >= 0),
  payment_method payment_method not null,
  bank_reference text,
  screenshot_url text,
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- 8. expenses
-- ============================================================
create table expenses (
  id               uuid primary key default uuid_generate_v4(),
  submitted_by     uuid not null references auth.users(id) on delete cascade,
  amount           numeric(10, 2) not null check (amount > 0),
  category         text not null,
  description      text,
  status           expense_status not null default 'pending',
  rejection_reason text,
  reviewed_by      uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger expenses_updated_at before update on expenses
  for each row execute procedure set_updated_at();

-- ============================================================
-- 9. quick_sales
-- ============================================================
create table quick_sales (
  id             uuid primary key default uuid_generate_v4(),
  staff_id       uuid not null references auth.users(id) on delete cascade,
  total          numeric(10, 2) not null check (total >= 0),
  payment_method payment_method not null,
  notes          text,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- 10. quick_sale_items
-- ============================================================
create table quick_sale_items (
  id            uuid primary key default uuid_generate_v4(),
  quick_sale_id uuid not null references quick_sales(id) on delete cascade,
  menu_item_id  uuid references menu_items(id) on delete set null,
  name          text not null,
  price         numeric(10, 2) not null,
  quantity      int not null check (quantity > 0)
);

-- ============================================================
-- 11. feedback
-- ============================================================
create table feedback (
  id            uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  rating        int not null check (rating between 1 and 5),
  message       text,
  order_id      uuid references orders(id) on delete set null,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 12. notifications
-- ============================================================
create table notifications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade,
  target_role   user_role,         -- null means targeted at specific user_id only
  type          text not null,
  title         text not null,
  message       text not null,
  action_url    text,
  order_ref     text,              -- legacy orderId string (e.g. "order-123-accepted")
  table_number  int,
  customer_name text,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 13. config
-- ============================================================
create table config (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

create trigger config_updated_at before update on config
  for each row execute procedure set_updated_at();

-- ============================================================
-- RLS: Enable on all tables
-- ============================================================
alter table profiles         enable row level security;
alter table categories       enable row level security;
alter table menu_items       enable row level security;
alter table inventory_items  enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table transactions     enable row level security;
alter table expenses         enable row level security;
alter table quick_sales      enable row level security;
alter table quick_sale_items enable row level security;
alter table feedback         enable row level security;
alter table notifications    enable row level security;
alter table config           enable row level security;

-- ─── Helper: get current user role ─────────────────────────
create or replace function current_user_role()
returns user_role language sql security definer stable as $$
  select role from profiles where id = auth.uid();
$$;

-- ============================================================
-- RLS Policies
-- ============================================================

-- ── profiles ─────────────────────────────────────────────────
create policy "users can read own profile"
  on profiles for select
  using (id = auth.uid());

create policy "users can update own profile"
  on profiles for update
  using (id = auth.uid());

create policy "admins can read all profiles"
  on profiles for select
  using (current_user_role() in ('admin', 'super-admin'));

-- ── categories ───────────────────────────────────────────────
create policy "anyone can read categories"
  on categories for select
  using (true);

create policy "admins can manage categories"
  on categories for all
  using (current_user_role() in ('admin', 'super-admin'));

-- ── menu_items ───────────────────────────────────────────────
create policy "anyone can read available menu items"
  on menu_items for select
  using (is_available = true or current_user_role() in ('admin', 'super-admin'));

create policy "admins can manage menu items"
  on menu_items for all
  using (current_user_role() in ('admin', 'super-admin'));

-- ── inventory_items ──────────────────────────────────────────
create policy "admins can manage inventory"
  on inventory_items for all
  using (current_user_role() in ('admin', 'super-admin'));

-- ── orders ───────────────────────────────────────────────────
create policy "customers can create orders"
  on orders for insert
  with check (true);

create policy "customers can read own orders"
  on orders for select
  using (
    customer_id = auth.uid()
    or current_user_role() in ('waiter', 'cashier', 'admin', 'super-admin')
  );

create policy "waiters can update orders"
  on orders for update
  using (current_user_role() in ('waiter', 'admin', 'super-admin'));

create policy "cashiers can update payment states"
  on orders for update
  using (current_user_role() in ('cashier', 'admin', 'super-admin'));

-- ── order_items ──────────────────────────────────────────────
create policy "order items follow order access"
  on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and (
          o.customer_id = auth.uid()
          or current_user_role() in ('waiter', 'cashier', 'admin', 'super-admin')
        )
    )
  );

create policy "anyone can insert order items"
  on order_items for insert
  with check (true);

-- ── transactions ─────────────────────────────────────────────
create policy "cashiers can create transactions"
  on transactions for insert
  with check (current_user_role() in ('cashier', 'admin', 'super-admin'));

create policy "cashiers and admins can read transactions"
  on transactions for select
  using (current_user_role() in ('cashier', 'admin', 'super-admin'));

-- ── expenses ─────────────────────────────────────────────────
create policy "cashiers can create expenses"
  on expenses for insert
  with check (submitted_by = auth.uid() and current_user_role() in ('cashier', 'admin', 'super-admin'));

create policy "cashiers can read own expenses"
  on expenses for select
  using (
    submitted_by = auth.uid()
    or current_user_role() in ('admin', 'super-admin')
  );

create policy "admins can update expense status"
  on expenses for update
  using (current_user_role() in ('admin', 'super-admin'));

-- ── quick_sales ──────────────────────────────────────────────
create policy "staff can create quick sales"
  on quick_sales for insert
  with check (staff_id = auth.uid() and current_user_role() in ('waiter', 'cashier', 'admin', 'super-admin'));

create policy "staff can read own quick sales"
  on quick_sales for select
  using (
    staff_id = auth.uid()
    or current_user_role() in ('admin', 'super-admin')
  );

-- ── quick_sale_items ─────────────────────────────────────────
create policy "quick sale items follow sale access"
  on quick_sale_items for select
  using (
    exists (
      select 1 from quick_sales qs
      where qs.id = quick_sale_items.quick_sale_id
        and (
          qs.staff_id = auth.uid()
          or current_user_role() in ('admin', 'super-admin')
        )
    )
  );

create policy "staff can insert quick sale items"
  on quick_sale_items for insert
  with check (true);

-- ── feedback ─────────────────────────────────────────────────
create policy "anyone can submit feedback"
  on feedback for insert
  with check (true);

create policy "admins can read feedback"
  on feedback for select
  using (current_user_role() in ('admin', 'super-admin'));

create policy "admins can update feedback read status"
  on feedback for update
  using (current_user_role() in ('admin', 'super-admin'));

-- ── notifications ────────────────────────────────────────────
create policy "users see their own or role-targeted notifications"
  on notifications for select
  using (
    user_id = auth.uid()
    or target_role = current_user_role()
  );

create policy "users can mark own notifications as read"
  on notifications for update
  using (user_id = auth.uid() or target_role = current_user_role());

-- ── config ───────────────────────────────────────────────────
create policy "anyone can read config"
  on config for select
  using (true);

create policy "admins can update config"
  on config for update
  using (current_user_role() in ('admin', 'super-admin'));
