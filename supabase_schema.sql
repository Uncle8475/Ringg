-- Cosmic Attire Supabase schema and RLS policies

-- Extensions
create extension if not exists "pgcrypto";

-- Updated-at helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================
-- Profiles
-- =========================
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  age text,
  role text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = user_id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles for delete
using (auth.uid() = user_id);

create index if not exists profiles_user_id_idx on public.profiles (user_id);

-- =========================
-- Rings
-- =========================
create table if not exists public.rings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ring_id text not null,
  status text not null default 'active',
  last_sync timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, ring_id)
);

drop trigger if exists set_rings_updated_at on public.rings;
create trigger set_rings_updated_at
before update on public.rings
for each row execute procedure public.set_updated_at();

alter table public.rings enable row level security;

drop policy if exists "rings_select_own" on public.rings;
create policy "rings_select_own"
on public.rings for select
using (auth.uid() = user_id);

drop policy if exists "rings_insert_own" on public.rings;
create policy "rings_insert_own"
on public.rings for insert
with check (auth.uid() = user_id);

drop policy if exists "rings_update_own" on public.rings;
create policy "rings_update_own"
on public.rings for update
using (auth.uid() = user_id);

drop policy if exists "rings_delete_own" on public.rings;
create policy "rings_delete_own"
on public.rings for delete
using (auth.uid() = user_id);

create index if not exists rings_user_id_idx on public.rings (user_id);

-- =========================
-- Transactions
-- =========================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ring_id text,
  amount numeric(12, 2) not null default 0,
  type text not null default 'payment',
  merchant text,
  category text,
  location text,
  description text,
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
on public.transactions for select
using (auth.uid() = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own"
on public.transactions for insert
with check (auth.uid() = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own"
on public.transactions for update
using (auth.uid() = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own"
on public.transactions for delete
using (auth.uid() = user_id);

create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_created_at_idx on public.transactions (created_at desc);

-- =========================
-- Wallets
-- =========================
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  balance numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_wallets_updated_at on public.wallets;
create trigger set_wallets_updated_at
before update on public.wallets
for each row execute procedure public.set_updated_at();

alter table public.wallets enable row level security;

drop policy if exists "wallets_select_own" on public.wallets;
create policy "wallets_select_own"
on public.wallets for select
using (auth.uid() = user_id);

drop policy if exists "wallets_insert_own" on public.wallets;
create policy "wallets_insert_own"
on public.wallets for insert
with check (auth.uid() = user_id);

drop policy if exists "wallets_update_own" on public.wallets;
create policy "wallets_update_own"
on public.wallets for update
using (auth.uid() = user_id);

drop policy if exists "wallets_delete_own" on public.wallets;
create policy "wallets_delete_own"
on public.wallets for delete
using (auth.uid() = user_id);

create index if not exists wallets_user_id_idx on public.wallets (user_id);

-- =========================
-- OTP Verifications
-- =========================
create table if not exists public.otp_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.otp_verifications enable row level security;

drop policy if exists "otp_select_own" on public.otp_verifications;
create policy "otp_select_own"
on public.otp_verifications for select
using (auth.uid() = user_id);

drop policy if exists "otp_insert_own" on public.otp_verifications;
create policy "otp_insert_own"
on public.otp_verifications for insert
with check (auth.uid() = user_id);

drop policy if exists "otp_update_own" on public.otp_verifications;
create policy "otp_update_own"
on public.otp_verifications for update
using (auth.uid() = user_id);

drop policy if exists "otp_delete_own" on public.otp_verifications;
create policy "otp_delete_own"
on public.otp_verifications for delete
using (auth.uid() = user_id);

create index if not exists otp_verifications_user_id_idx on public.otp_verifications (user_id);

-- =========================
-- E-Summit Resumes
-- =========================
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_type text not null,
  file_path text not null,
  file_name text,
  file_type text,
  file_size integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_resumes_updated_at on public.resumes;
create trigger set_resumes_updated_at
before update on public.resumes
for each row execute procedure public.set_updated_at();

alter table public.resumes enable row level security;

drop policy if exists "resumes_select_own" on public.resumes;
create policy "resumes_select_own"
on public.resumes for select
using (auth.uid() = user_id);

drop policy if exists "resumes_insert_own" on public.resumes;
create policy "resumes_insert_own"
on public.resumes for insert
with check (auth.uid() = user_id);

drop policy if exists "resumes_update_own" on public.resumes;
create policy "resumes_update_own"
on public.resumes for update
using (auth.uid() = user_id);

drop policy if exists "resumes_delete_own" on public.resumes;
create policy "resumes_delete_own"
on public.resumes for delete
using (auth.uid() = user_id);

create index if not exists resumes_user_id_idx on public.resumes (user_id);
create index if not exists resumes_resume_type_idx on public.resumes (resume_type);
create index if not exists resumes_created_at_idx on public.resumes (created_at desc);

-- =========================
-- Resume Applications
-- =========================
create table if not exists public.resume_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  company_name text not null,
  role text not null,
  status text not null default 'Applied',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_resume_applications_updated_at on public.resume_applications;
create trigger set_resume_applications_updated_at
before update on public.resume_applications
for each row execute procedure public.set_updated_at();

alter table public.resume_applications enable row level security;

drop policy if exists "resume_applications_select_own" on public.resume_applications;
create policy "resume_applications_select_own"
on public.resume_applications for select
using (auth.uid() = user_id);

drop policy if exists "resume_applications_insert_own" on public.resume_applications;
create policy "resume_applications_insert_own"
on public.resume_applications for insert
with check (auth.uid() = user_id);

drop policy if exists "resume_applications_update_own" on public.resume_applications;
create policy "resume_applications_update_own"
on public.resume_applications for update
using (auth.uid() = user_id);

drop policy if exists "resume_applications_delete_own" on public.resume_applications;
create policy "resume_applications_delete_own"
on public.resume_applications for delete
using (auth.uid() = user_id);

create index if not exists resume_applications_user_id_idx on public.resume_applications (user_id);
create index if not exists resume_applications_resume_id_idx on public.resume_applications (resume_id);
create index if not exists resume_applications_created_at_idx on public.resume_applications (created_at desc);
