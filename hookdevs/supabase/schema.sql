-- =========================================================
-- HOOKDEVS — schema para Supabase
-- Pegar entero en: Supabase > SQL Editor > New query > Run
-- =========================================================
--
-- IMPORTANTE: esta app NO usa el sistema de Auth de Supabase. El login
-- (usuario + contraseña) vive solo en el navegador de cada persona
-- (localStorage). Estas tablas solo existen para que:
--   1) los apodos sean únicos entre todos los usuarios,
--   2) el chat pueda encontrar gente y guardar mensajes,
--   3) cada quien pueda guardar sus marcadores de búsquedas de trabajo.
--
-- Como no hay Auth real, las políticas son permisivas (cualquiera puede
-- leer/escribir). Es un nivel de seguridad de prototipo, no de producción:
-- cualquiera con la anon key podría en teoría escribir datos arbitrarios.
-- Para producción real habría que sumar autenticación de verdad.

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Lectura pública habilitada (necesaria para que el chat pueda buscar
-- gente y mostrar nombres). El código del frontend NUNCA pide la columna
-- password_hash en sus consultas (siempre selecciona "id, username"
-- explícitamente) — por eso el hash nunca viaja al navegador aunque la
-- fila sea legible. No se puede loguear insertando directo desde el
-- cliente: eso solo lo permiten las funciones de abajo.
create policy "profiles: lectura publica" on profiles for select using (true);
create policy "profiles: sin insert directo" on profiles for insert with check (false);
create policy "profiles: sin update directo" on profiles for update using (false);

-- ---------- Registro: crea la cuenta y devuelve el id ----------
create or replace function register_account(p_username text, p_password text)
returns table(id uuid, username text) as $$
declare
  new_id uuid;
begin
  if length(p_username) < 3 or length(p_username) > 24 then
    raise exception 'apodo_invalido';
  end if;
  if length(p_password) < 4 then
    raise exception 'password_invalida';
  end if;
  if exists (select 1 from profiles p where lower(p.username) = lower(p_username)) then
    raise exception 'apodo_en_uso';
  end if;

  insert into profiles (username, password_hash)
  values (p_username, crypt(p_password, gen_salt('bf')))
  returning profiles.id into new_id;

  return query select new_id, p_username;
end;
$$ language plpgsql security definer;

-- ---------- Login: valida contraseña y devuelve el id si es correcta ----------
create or replace function login_account(p_username text, p_password text)
returns table(id uuid, username text) as $$
begin
  return query
    select p.id, p.username
    from profiles p
    where lower(p.username) = lower(p_username)
      and p.password_hash = crypt(p_password, p.password_hash);
end;
$$ language plpgsql security definer;

grant execute on function register_account(text, text) to anon, authenticated;
grant execute on function login_account(text, text) to anon, authenticated;

create table if not exists saved_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  tipo text not null default 'empleo',
  title text not null,
  url text not null,
  description text,
  meta jsonb,
  created_at timestamptz default now()
);

alter table saved_items enable row level security;
create policy "saved_items: lectura publica" on saved_items for select using (true);
create policy "saved_items: escritura publica" on saved_items for all using (true) with check (true);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

alter table conversations enable row level security;
create policy "conversations: lectura publica" on conversations for select using (true);
create policy "conversations: alta publica" on conversations for insert with check (true);

create table if not exists conversation_members (
  conversation_id uuid references conversations(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  primary key (conversation_id, profile_id)
);

alter table conversation_members enable row level security;
create policy "conversation_members: lectura publica" on conversation_members for select using (true);
create policy "conversation_members: alta publica" on conversation_members for insert with check (true);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id uuid references profiles(id) not null,
  content text not null,
  created_at timestamptz default now()
);

alter table messages enable row level security;
create policy "messages: lectura publica" on messages for select using (true);
create policy "messages: alta publica" on messages for insert with check (true);
