-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create organizations table
create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table (links auth.users to organizations)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id),
  role text default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create business_cards table
create table business_cards (
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

-- RLS Policies

-- Profiles: Users can view their own profile and profiles in their organization
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can view profiles in their organization"
  on profiles for select
  using (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

-- Organizations: Users can view their own organization
create policy "Users can view their own organization"
  on organizations for select
  using (
    id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

-- Business Cards: Users can view/insert cards only for their organization
create policy "Users can view cards in their organization"
  on business_cards for select
  using (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

create policy "Users can insert cards for their organization"
  on business_cards for insert
  with check (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

-- Function to handle new user signup (optional but recommended)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
