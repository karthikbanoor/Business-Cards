-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create organizations table
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table (links auth.users to organizations)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id),
  role text default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create business_cards table
create table if not exists business_cards (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  image_url text not null,
  extracted_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table business_cards enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Users can view profiles in their organization" on profiles;
drop policy if exists "Users can view their own organization" on organizations;
drop policy if exists "Users can view cards in their organization" on business_cards;
drop policy if exists "Users can insert cards for their organization" on business_cards;

-- RLS Policies

-- Profiles: Users can view their own profile
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Helper function to get current user's organization_id (Security Definer to bypass RLS)
create or replace function get_auth_user_org_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select organization_id from profiles where id = auth.uid()
$$;

-- Profiles: Users can view profiles in their organization (using helper function to avoid recursion)
create policy "Users can view profiles in their organization"
  on profiles for select
  using (
    organization_id = get_auth_user_org_id()
  );

-- Organizations: Users can view their own organization
create policy "Users can view their own organization"
  on organizations for select
  using (
    id = get_auth_user_org_id()
  );

-- Business Cards: Users can view/insert cards only for their organization
create policy "Users can view cards in their organization"
  on business_cards for select
  using (
    organization_id = get_auth_user_org_id()
  );

create policy "Users can insert cards for their organization"
  on business_cards for insert
  with check (
    organization_id = get_auth_user_org_id()
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup (drop if exists to avoid error)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
