-- Allow users to delete cards in their organization
create policy "Users can delete cards in their organization"
  on business_cards for delete
  using (
    organization_id = get_auth_user_org_id()
  );
