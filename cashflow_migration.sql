-- Cash Flow Management Migration
-- This adds ONLY the new tables for cash flow management
-- Run this in your Supabase SQL Editor

-- Cash Flow Management Tables

-- Partners table (Putty and Sony)
create table if not exists partners (
  id bigserial primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Partner contributions table
create table if not exists partner_contributions (
  id bigserial primary key,
  partner_id bigint references partners(id) on delete cascade,
  amount numeric not null check (amount >= 0),
  contribution_date date not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Expenses table
create table if not exists expenses (
  id bigserial primary key,
  description text not null,
  amount numeric not null check (amount >= 0),
  expense_date date not null,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for cash flow tables
create index if not exists idx_partner_contributions_partner_id on partner_contributions(partner_id);
create index if not exists idx_partner_contributions_date on partner_contributions(contribution_date);
create index if not exists idx_expenses_date on expenses(expense_date);
create index if not exists idx_expenses_category on expenses(category);

-- Enable RLS for cash flow tables
alter table partners enable row level security;
alter table partner_contributions enable row level security;
alter table expenses enable row level security;

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "Enable all access for partners" on partners;
drop policy if exists "Enable all access for partner_contributions" on partner_contributions;
drop policy if exists "Enable all access for expenses" on expenses;

-- Create policies for cash flow tables
create policy "Enable all access for partners" on partners
  for all using (true);

create policy "Enable all access for partner_contributions" on partner_contributions
  for all using (true);

create policy "Enable all access for expenses" on expenses
  for all using (true);

-- Insert default partners (Putty and Sony)
insert into partners (name) values ('Putty'), ('Sony')
on conflict (name) do nothing;

-- Verify the migration
select 'Partners table created' as status, count(*) as partner_count from partners;
