// Esquema completo. Se aplica solo al arrancar (todo es "if not exists").
export const SCHEMA = `
create table if not exists meta (k text primary key, v text not null);

create table if not exists roles (
  name text primary key,
  label text not null,
  can_wa boolean not null default true,
  can_calls boolean not null default true,
  wa_daily int not null default 15,
  call_batch int not null default 20,
  is_owner boolean not null default false,
  created_at timestamptz not null default now()
);
insert into roles(name, label, is_owner) values ('owner', 'Dueño', true) on conflict do nothing;
insert into roles(name, label) values ('closer', 'Closer') on conflict do nothing;

create table if not exists users (
  id serial primary key,
  email text not null unique,
  name text not null,
  phone text,
  role text not null default 'closer' references roles(name) on update cascade,
  status text not null default 'pending' check (status in ('pending','active','disabled','rejected')),
  code_hash text,
  pending_code text,
  fails int not null default 0,
  locked_until timestamptz,
  reg_ip text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  last_login timestamptz
);

create table if not exists sessions (
  token_hash text primary key,
  user_id int not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists otps (
  ticket_hash text primary key,
  user_id int not null references users(id) on delete cascade,
  code_hash text not null,
  attempts int not null default 0,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists prospects (
  id serial primary key,
  name text not null,
  name_key text not null unique,
  category text,
  district text,
  web text,
  problem text,
  need text,
  priority int not null default 0,
  wa_phone text unique,
  wa_msg text,
  phones jsonb not null default '[]',
  call_script text,
  status text not null default 'active' check (status in ('active','blocked','client')),
  owner_id int references users(id) on delete set null,
  wa_state text not null default 'none' check (wa_state in ('none','pool','assigned','done')),
  wa_user int references users(id) on delete set null,
  wa_day date,
  wa_at timestamptz,
  wa_result text,
  call_state text not null default 'none' check (call_state in ('none','pool','assigned','done')),
  call_user int references users(id) on delete set null,
  call_day date,
  call_seq int,
  call_dialed_at timestamptz,
  call_attempts int not null default 0,
  call_next date,
  call_result text,
  call_at timestamptz,
  interested_at timestamptz,
  interested_by int references users(id) on delete set null,
  note text,
  source text,
  created_at timestamptz not null default now()
);
create index if not exists prospects_wa on prospects (wa_state, priority desc, id);
create index if not exists prospects_call on prospects (call_state, priority desc, id);
create index if not exists prospects_wa_user on prospects (wa_user, wa_day);
create index if not exists prospects_call_user on prospects (call_user, call_state);

create table if not exists user_day (
  user_id int not null references users(id) on delete cascade,
  day date not null,
  call_batches int not null default 0,
  primary key (user_id, day)
);

create table if not exists activity (
  id bigserial primary key,
  at timestamptz not null default now(),
  day date not null,
  user_id int references users(id) on delete set null,
  kind text not null,
  prospect_id int references prospects(id) on delete set null,
  result text,
  note text,
  ip text
);
create index if not exists activity_at on activity (at desc);
create index if not exists activity_user_day on activity (user_id, day);
create index if not exists activity_kind_day on activity (kind, day);
`;
