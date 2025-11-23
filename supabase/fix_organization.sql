-- Update the handle_new_user function to automatically create an organization
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_org_id uuid;
begin
  -- Create a default organization for the user
  insert into public.organizations (name, owner_id)
  values ('My Organization', new.id)
  returning id into new_org_id;

  -- Create the user profile linked to the organization
  insert into public.profiles (id, organization_id, role)
  values (new.id, new_org_id, 'owner');

  return new;
end;
$$ language plpgsql security definer;

-- One-time fix for existing users who have a profile but no organization
do $$
declare
  r record;
  new_org_id uuid;
begin
  for r in select * from public.profiles where organization_id is null loop
    -- Create org for this user
    insert into public.organizations (name, owner_id)
    values ('My Organization', r.id)
    returning id into new_org_id;

    -- Update their profile
    update public.profiles
    set organization_id = new_org_id, role = 'owner'
    where id = r.id;
  end loop;
end;
$$;
