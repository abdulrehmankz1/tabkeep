-- TabKeep — Supabase schema, RLS policies, and WatermelonDB sync RPCs.
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).

-- ============================================================
-- Tables
-- ============================================================
-- Column names match the local WatermelonDB schema exactly so records can be
-- passed through as-is. `inserted_at` / `server_updated_at` / `server_deleted_at`
-- are server-only bookkeeping for the sync protocol and are never sent to clients.

create table if not exists public.expenses (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount bigint not null,
  category text not null,
  note text,
  occurred_at bigint not null,
  source text not null,
  receipt_image text,
  created_at bigint not null,
  deleted_at bigint,
  inserted_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now(),
  server_deleted_at timestamptz
);
create index if not exists expenses_user_id_idx on public.expenses(user_id);

create table if not exists public.people (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  created_at bigint not null,
  deleted_at bigint,
  inserted_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now(),
  server_deleted_at timestamptz
);
create index if not exists people_user_id_idx on public.people(user_id);

create table if not exists public.transactions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  person_id text not null,
  amount bigint not null,
  direction text not null,
  note text,
  occurred_at bigint not null,
  created_at bigint not null,
  inserted_at timestamptz not null default now(),
  server_updated_at timestamptz not null default now(),
  server_deleted_at timestamptz
);
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_person_id_idx on public.transactions(person_id);

-- ============================================================
-- Row Level Security — every user can only ever see/write their own rows
-- ============================================================

alter table public.expenses enable row level security;
alter table public.people enable row level security;
alter table public.transactions enable row level security;

create policy "Users manage own expenses" on public.expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own people" on public.people
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own transactions" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- pull_changes — returns everything changed since last_pulled_at for this user
-- ============================================================

create or replace function public.pull_changes(last_pulled_at bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cutoff timestamptz := to_timestamp(coalesce(last_pulled_at, 0) / 1000.0);
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  return jsonb_build_object(
    'changes', jsonb_build_object(
      'expenses', jsonb_build_object(
        'created', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', id, 'user_id', user_id, 'amount', amount, 'category', category,
            'note', note, 'occurred_at', occurred_at, 'source', source,
            'receipt_image', receipt_image, 'created_at', created_at, 'deleted_at', deleted_at
          ))
          from public.expenses
          where user_id = uid and inserted_at > cutoff and server_deleted_at is null
        ), '[]'::jsonb),
        'updated', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', id, 'user_id', user_id, 'amount', amount, 'category', category,
            'note', note, 'occurred_at', occurred_at, 'source', source,
            'receipt_image', receipt_image, 'created_at', created_at, 'deleted_at', deleted_at
          ))
          from public.expenses
          where user_id = uid and inserted_at <= cutoff and server_updated_at > cutoff and server_deleted_at is null
        ), '[]'::jsonb),
        'deleted', coalesce((
          select jsonb_agg(id)
          from public.expenses
          where user_id = uid and server_deleted_at > cutoff
        ), '[]'::jsonb)
      ),
      'people', jsonb_build_object(
        'created', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', id, 'user_id', user_id, 'name', name, 'phone', phone,
            'created_at', created_at, 'deleted_at', deleted_at
          ))
          from public.people
          where user_id = uid and inserted_at > cutoff and server_deleted_at is null
        ), '[]'::jsonb),
        'updated', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', id, 'user_id', user_id, 'name', name, 'phone', phone,
            'created_at', created_at, 'deleted_at', deleted_at
          ))
          from public.people
          where user_id = uid and inserted_at <= cutoff and server_updated_at > cutoff and server_deleted_at is null
        ), '[]'::jsonb),
        'deleted', coalesce((
          select jsonb_agg(id)
          from public.people
          where user_id = uid and server_deleted_at > cutoff
        ), '[]'::jsonb)
      ),
      'transactions', jsonb_build_object(
        'created', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', id, 'user_id', user_id, 'person_id', person_id, 'amount', amount,
            'direction', direction, 'note', note, 'occurred_at', occurred_at, 'created_at', created_at
          ))
          from public.transactions
          where user_id = uid and inserted_at > cutoff and server_deleted_at is null
        ), '[]'::jsonb),
        'updated', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', id, 'user_id', user_id, 'person_id', person_id, 'amount', amount,
            'direction', direction, 'note', note, 'occurred_at', occurred_at, 'created_at', created_at
          ))
          from public.transactions
          where user_id = uid and inserted_at <= cutoff and server_updated_at > cutoff and server_deleted_at is null
        ), '[]'::jsonb),
        'deleted', coalesce((
          select jsonb_agg(id)
          from public.transactions
          where user_id = uid and server_deleted_at > cutoff
        ), '[]'::jsonb)
      )
    ),
    'timestamp', (extract(epoch from now()) * 1000)::bigint
  );
end;
$$;

grant execute on function public.pull_changes(bigint) to authenticated;

-- ============================================================
-- push_changes — applies local changes from the client
-- ============================================================

create or replace function public.push_changes(changes jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec jsonb;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  -- expenses: created + updated
  for rec in
    select * from jsonb_array_elements(
      coalesce(changes->'expenses'->'created', '[]'::jsonb) ||
      coalesce(changes->'expenses'->'updated', '[]'::jsonb)
    )
  loop
    insert into public.expenses (id, user_id, amount, category, note, occurred_at, source, receipt_image, created_at, deleted_at)
    values (
      rec->>'id', uid, (rec->>'amount')::bigint, rec->>'category', rec->>'note',
      (rec->>'occurred_at')::bigint, rec->>'source', rec->>'receipt_image',
      (rec->>'created_at')::bigint, (rec->>'deleted_at')::bigint
    )
    on conflict (id) do update set
      amount = excluded.amount, category = excluded.category, note = excluded.note,
      occurred_at = excluded.occurred_at, source = excluded.source,
      receipt_image = excluded.receipt_image, deleted_at = excluded.deleted_at,
      server_updated_at = now()
    where public.expenses.user_id = uid;
  end loop;

  update public.expenses set server_deleted_at = now()
  where user_id = uid and id in (
    select jsonb_array_elements_text(coalesce(changes->'expenses'->'deleted', '[]'::jsonb))
  );

  -- people: created + updated
  for rec in
    select * from jsonb_array_elements(
      coalesce(changes->'people'->'created', '[]'::jsonb) ||
      coalesce(changes->'people'->'updated', '[]'::jsonb)
    )
  loop
    insert into public.people (id, user_id, name, phone, created_at, deleted_at)
    values (
      rec->>'id', uid, rec->>'name', rec->>'phone',
      (rec->>'created_at')::bigint, (rec->>'deleted_at')::bigint
    )
    on conflict (id) do update set
      name = excluded.name, phone = excluded.phone, deleted_at = excluded.deleted_at,
      server_updated_at = now()
    where public.people.user_id = uid;
  end loop;

  update public.people set server_deleted_at = now()
  where user_id = uid and id in (
    select jsonb_array_elements_text(coalesce(changes->'people'->'deleted', '[]'::jsonb))
  );

  -- transactions: created + updated
  for rec in
    select * from jsonb_array_elements(
      coalesce(changes->'transactions'->'created', '[]'::jsonb) ||
      coalesce(changes->'transactions'->'updated', '[]'::jsonb)
    )
  loop
    insert into public.transactions (id, user_id, person_id, amount, direction, note, occurred_at, created_at)
    values (
      rec->>'id', uid, rec->>'person_id', (rec->>'amount')::bigint, rec->>'direction',
      rec->>'note', (rec->>'occurred_at')::bigint, (rec->>'created_at')::bigint
    )
    on conflict (id) do update set
      person_id = excluded.person_id, amount = excluded.amount, direction = excluded.direction,
      note = excluded.note, occurred_at = excluded.occurred_at,
      server_updated_at = now()
    where public.transactions.user_id = uid;
  end loop;

  update public.transactions set server_deleted_at = now()
  where user_id = uid and id in (
    select jsonb_array_elements_text(coalesce(changes->'transactions'->'deleted', '[]'::jsonb))
  );
end;
$$;

grant execute on function public.push_changes(jsonb) to authenticated;
