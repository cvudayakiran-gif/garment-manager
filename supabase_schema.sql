-- Garment Manager - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (for clean setup)
drop table if exists sale_items cascade;
drop table if exists sales cascade;
drop table if exists items cascade;

-- Create Items Table (equivalent to the SQLite items table)
create table items (
  id bigserial primary key,
  name text not null,
  sku text unique,
  price numeric not null,
  cost numeric default 0,
  stock integer default 0,
  category text,
  source text,
  image_path text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Sales Table
create table sales (
  id bigserial primary key,
  total numeric not null,
  payment_method text,
  discount numeric default 0,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Sale Items Table (junction table)
create table sale_items (
  id bigserial primary key,
  sale_id bigint references sales(id) on delete cascade,
  item_id bigint references items(id) on delete cascade,
  quantity integer not null,
  price_at_sale numeric not null
);

-- Create indexes for better query performance
create index idx_items_category on items(category);
create index idx_items_source on items(source);
create index idx_items_created_at on items(created_at);
create index idx_sales_created_at on sales(created_at);
create index idx_sales_status on sales(status);
create index idx_sale_items_sale_id on sale_items(sale_id);
create index idx_sale_items_item_id on sale_items(item_id);

-- Enable Row Level Security (RLS)
alter table items enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;

-- Create policies for public access (since we have simple PIN auth)
-- In production, you might want to make these more restrictive

create policy "Enable read access for all users" on items
  for select using (true);

create policy "Enable insert for all users" on items
  for insert with check (true);

create policy "Enable update for all users" on items
  for update using (true);

create policy "Enable delete for all users" on items
  for delete using (true);

create policy "Enable all access for sales" on sales
  for all using (true);

create policy "Enable all access for sale_items" on sale_items
  for all using (true);

-- Create storage bucket for saree images
insert into storage.buckets (id, name, public)
values ('saree-images', 'saree-images', true)
on conflict (id) do nothing;

-- Allow public access to saree images bucket
create policy "Public Access for saree images"
on storage.objects for select
using (bucket_id = 'saree-images');

create policy "Authenticated users can upload saree images"
on storage.objects for insert
with check (bucket_id = 'saree-images');

create policy "Authenticated users can update saree images"
on storage.objects for update
using (bucket_id = 'saree-images');

create policy "Authenticated users can delete saree images"
on storage.objects for delete
using (bucket_id = 'saree-images');
