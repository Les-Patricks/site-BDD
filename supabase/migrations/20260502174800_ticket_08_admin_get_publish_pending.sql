create or replace function public.admin_get_publish_pending()
returns boolean
language sql
as $$
	select coalesce(
		(
			select publish_pending
			from public.admin_state
			where id = 'global'
			limit 1
		),
		false
	);
$$;

revoke all on function public.admin_get_publish_pending() from public;
revoke all on function public.admin_get_publish_pending() from anon;
revoke all on function public.admin_get_publish_pending() from authenticated;
grant execute on function public.admin_get_publish_pending() to service_role;
