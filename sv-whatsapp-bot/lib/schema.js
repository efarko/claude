export const SCHEMA = `
create table if not exists wa_chats (
  wa_id text primary key,
  name text,
  paused_until timestamptz,
  stage text,
  business text,
  updated_at timestamptz not null default now()
);
create table if not exists wa_messages (
  id bigserial primary key,
  wa_id text not null,
  role text not null check (role in ('user', 'assistant', 'franco')),
  body text not null,
  msg_id text unique,
  at timestamptz not null default now()
);
create index if not exists wa_messages_chat on wa_messages (wa_id, id);
`;
