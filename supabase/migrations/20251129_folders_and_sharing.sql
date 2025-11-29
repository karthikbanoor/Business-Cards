-- Create folders table
create table if not exists folders (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) not null,
  name text not null,
  share_token uuid default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add folder_id and share_token to business_cards if they don't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'business_cards' and column_name = 'folder_id') then
        alter table business_cards add column folder_id uuid references folders(id);
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'business_cards' and column_name = 'share_token') then
        alter table business_cards add column share_token uuid default uuid_generate_v4();
    end if;
end $$;

-- Enable RLS for folders
alter table folders enable row level security;

-- Folders Policies
create policy "Users can view folders in their organization"
  on folders for select
  using (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

create policy "Users can insert folders for their organization"
  on folders for insert
  with check (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

create policy "Users can update folders in their organization"
  on folders for update
  using (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

create policy "Users can delete folders in their organization"
  on folders for delete
  using (
    organization_id in (
      select organization_id from profiles where id = auth.uid()
    )
  );

-- Public Access Functions (Security Definer to bypass RLS for public tokens)

-- Get a single shared card by token
create or replace function get_shared_card(token uuid)
returns setof business_cards
language sql
security definer
as $$
  select * from business_cards where share_token = token;
$$;

-- Get a shared folder details by token
create or replace function get_shared_folder(token uuid)
returns setof folders
language sql
security definer
as $$
  select * from folders where share_token = token;
$$;

-- Get cards within a shared folder by folder token
create or replace function get_folder_cards(token uuid)
returns setof business_cards
language sql
security definer
as $$
  select b.* from business_cards b
  join folders f on b.folder_id = f.id
  where f.share_token = token;
$$;
