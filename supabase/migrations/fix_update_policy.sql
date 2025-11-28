-- Enable UPDATE for authenticated users on business_cards table

-- First, check if a policy already exists (we can't easily check in SQL without complex queries, so we'll drop and recreate or create if not exists)

-- Drop existing update policy if it exists (to be safe and ensure we set the correct one)
DROP POLICY IF EXISTS "Users can update their own cards" ON business_cards;

-- Create the policy
CREATE POLICY "Users can update their own cards"
ON business_cards
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM organization_members WHERE organization_id = business_cards.organization_id
  )
);

-- Alternatively, if we are using a simpler model where users own the cards directly or via organization_id in profile:
-- Let's assume the standard RLS where users can update cards in their organization.

-- If the above is too complex or if organization_members isn't set up as expected, we can try a simpler one based on the profile check we do in the code.
-- But usually, RLS checks against the row's organization_id.

-- Let's try a broader policy for now to unblock, assuming the user is authenticated.
-- Ideally:
-- CREATE POLICY "Enable update for users based on organization" ON "public"."business_cards"
-- FOR UPDATE USING (
--   (auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.organization_id = business_cards.organization_id) ))
-- ) WITH CHECK (
--   (auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.organization_id = business_cards.organization_id) ))
-- );

-- SIMPLIFIED FIX:
-- If you are the only user or it's a simple app, we can allow update for authenticated users.
-- But let's stick to the organization logic if possible.

-- Let's try this robust one:
CREATE POLICY "Users can update their own organization cards"
ON business_cards
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);
