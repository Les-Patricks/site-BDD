create or replace function public.admin_save_and_mark_pending(p_payload jsonb)
returns void
language plpgsql
as $$
begin
	perform public.admin_save_global_atomic(p_payload);
	perform public.admin_set_publish_pending(true);
end;
$$;

revoke all on function public.admin_save_and_mark_pending(jsonb) from public;
revoke all on function public.admin_save_and_mark_pending(jsonb) from anon;
revoke all on function public.admin_save_and_mark_pending(jsonb) from authenticated;
grant execute on function public.admin_save_and_mark_pending(jsonb) to service_role;
