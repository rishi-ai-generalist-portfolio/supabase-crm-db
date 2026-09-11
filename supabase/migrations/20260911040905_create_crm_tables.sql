-- =====================================================================
-- CRM Database Schema
-- Target: PostgreSQL (Supabase)
-- Tables: Lead, Contact, Deal, Task
-- =====================================================================

-- Enable UUID generation (Supabase usually has this on by default,
-- but this makes the script safe to run standalone)
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. LEAD
-- ---------------------------------------------------------------------
create table if not exists lead (
    lead_id     uuid primary key default gen_random_uuid(),
    name        text not null,
    company     text,
    email       text not null,
    status      text not null default 'New'
                    check (status in ('New', 'In-progress', 'Qualified', 'Disqualified')),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. CONTACT
-- ---------------------------------------------------------------------
create table if not exists contact (
    contact_id  uuid primary key default gen_random_uuid(),
    name        text not null,
    email       text not null,
    phone       text,
    account_id  uuid,              -- company/account reference (no Account table
                                    -- was specified in the source doc, so this is
                                    -- left as a plain uuid column; add a foreign
                                    -- key here once an Account table exists)
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. DEAL
-- ---------------------------------------------------------------------
create table if not exists deal (
    deal_id     uuid primary key default gen_random_uuid(),
    account_id  uuid,
    contact_id  uuid not null references contact (contact_id) on delete cascade,
    amount      numeric(12, 2) not null default 0,
    stage       text not null default 'Discovery'
                    check (stage in ('Discovery', 'Proposal Sent', 'Negotiation',
                                      'Closed Won', 'Closed Lost')),
    close_date  date,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 4. TASK
-- ---------------------------------------------------------------------
-- Note: Parent_ID is a polymorphic reference (it may point to Lead,
-- Contact, or Deal depending on Parent_Type). Postgres can't enforce a
-- single FK constraint against three different tables at once, so this
-- is validated at the application layer instead. The trigger below adds
-- a lightweight safety check so bad data can't be inserted directly.
create table if not exists task (
    task_id     uuid primary key default gen_random_uuid(),
    title       text not null,
    due_date    date,
    status      text not null default 'Pending'
                    check (status in ('Pending', 'Completed', 'Overdue', 'Cancelled')),
    parent_type text not null
                    check (parent_type in ('Lead', 'Contact', 'Deal')),
    parent_id   uuid not null,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- Enforce that parent_id actually exists in the table implied by parent_type
create or replace function check_task_parent()
returns trigger as $$
begin
    if new.parent_type = 'Lead' and not exists (select 1 from lead where lead_id = new.parent_id) then
        raise exception 'parent_id % does not exist in lead', new.parent_id;
    elsif new.parent_type = 'Contact' and not exists (select 1 from contact where contact_id = new.parent_id) then
        raise exception 'parent_id % does not exist in contact', new.parent_id;
    elsif new.parent_type = 'Deal' and not exists (select 1 from deal where deal_id = new.parent_id) then
        raise exception 'parent_id % does not exist in deal', new.parent_id;
    end if;
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_check_task_parent on task;
create trigger trg_check_task_parent
    before insert or update on task
    for each row execute function check_task_parent();

-- ---------------------------------------------------------------------
-- Helpful indexes
-- ---------------------------------------------------------------------
create index if not exists idx_lead_status        on lead (status);
create index if not exists idx_deal_stage          on deal (stage);
create index if not exists idx_deal_contact_id     on deal (contact_id);
create index if not exists idx_task_parent         on task (parent_type, parent_id);
create index if not exists idx_task_status         on task (status);

-- ---------------------------------------------------------------------
-- Auto-update the updated_at column on row changes
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_lead_updated_at on lead;
create trigger trg_lead_updated_at before update on lead
    for each row execute function set_updated_at();

drop trigger if exists trg_contact_updated_at on contact;
create trigger trg_contact_updated_at before update on contact
    for each row execute function set_updated_at();

drop trigger if exists trg_deal_updated_at on deal;
create trigger trg_deal_updated_at before update on deal
    for each row execute function set_updated_at();

drop trigger if exists trg_task_updated_at on task;
create trigger trg_task_updated_at before update on task
    for each row execute function set_updated_at();
