-- Make image_url nullable to support manual entry
alter table business_cards alter column image_url drop not null;
