create table if not exists public.admin_state (
	id text primary key,
	publish_pending boolean not null default false,
	updated_at timestamptz not null default now()
);

insert into public.admin_state (id, publish_pending)
values ('global', false)
on conflict (id) do nothing;

alter table public.admin_state enable row level security;

create or replace function public.admin_set_publish_pending(p_pending boolean)
returns void
language plpgsql
as $$
begin
	insert into public.admin_state (id, publish_pending, updated_at)
	values ('global', p_pending, now())
	on conflict (id) do update set
		publish_pending = excluded.publish_pending,
		updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.admin_set_publish_pending(boolean) from public;
revoke all on function public.admin_set_publish_pending(boolean) from anon;
revoke all on function public.admin_set_publish_pending(boolean) from authenticated;
grant execute on function public.admin_set_publish_pending(boolean) to service_role;
