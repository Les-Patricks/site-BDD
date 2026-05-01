-- Fix for ambiguous identifier references in admin_save_global_atomic.
-- We keep behavior identical and only rename local variables to avoid
-- collisions with table column names like `word_id` / `word_family_id`.
create or replace function public.admin_save_global_atomic(
	p_payload jsonb
)
returns void
language plpgsql
as $$
declare
	language_item jsonb;
	word_item jsonb;
	family_item jsonb;
	delete_word_id text;
	delete_language_id text;
	delete_family_id text;
	translation_item record;
	v_word_id text;
	v_family_id text;
begin
	for language_item in
		select value from jsonb_array_elements(coalesce(p_payload->'languages', '[]'::jsonb))
	loop
		insert into public.language (language_id, name, modification_date)
		values (
			language_item->>'language_id',
			language_item->>'name',
			(language_item->>'modification_date')::timestamptz
		)
		on conflict (language_id)
		do update set
			name = excluded.name,
			modification_date = excluded.modification_date;
	end loop;

	for word_item in
		select value from jsonb_array_elements(coalesce(p_payload->'words', '[]'::jsonb))
	loop
		v_word_id := word_item->>'word';

		insert into public.words (word_id, modification_date)
		values (
			v_word_id,
			(word_item->>'date')::timestamptz
		)
		on conflict (word_id)
		do update set modification_date = excluded.modification_date;

		if exists (
			select 1
			from jsonb_array_elements_text(
				coalesce(p_payload->'toDelete'->'traductions', '[]'::jsonb)
			) as t(word_id_to_delete)
			where t.word_id_to_delete = v_word_id
		) then
			delete from public.word_translation
			where word_translation.word_id = v_word_id;
		end if;

		for translation_item in
			select key as language_id, value as translation_value
			from jsonb_each(coalesce(word_item->'traductions', '{}'::jsonb))
		loop
			insert into public.word_translation (word_id, language_id, value)
			values (
				v_word_id,
				translation_item.language_id,
				case
					when jsonb_typeof(translation_item.translation_value) = 'null' then null
					else translation_item.translation_value #>> '{}'
				end
			)
			on conflict (word_id, language_id)
			do update set value = excluded.value;
		end loop;
	end loop;

	for family_item in
		select value from jsonb_array_elements(coalesce(p_payload->'families', '[]'::jsonb))
	loop
		v_family_id := family_item->>'word_family_id';

		insert into public.word_family (word_family_id, modification_date)
		values (
			v_family_id,
			(family_item->>'modification_date')::timestamptz
		)
		on conflict (word_family_id)
		do update set modification_date = excluded.modification_date;

		delete from public.word_family_association
		where word_family_association.word_family_id = v_family_id;

		insert into public.word_family_association (word_id, word_family_id)
		select words.word_id_value, v_family_id
		from jsonb_array_elements_text(coalesce(family_item->'words', '[]'::jsonb)) as words(word_id_value)
		on conflict (word_id, word_family_id) do nothing;
	end loop;

	for delete_word_id in
		select value
		from jsonb_array_elements_text(coalesce(p_payload->'toDelete'->'traductions', '[]'::jsonb))
	loop
		if not exists (
			select 1
			from jsonb_array_elements(coalesce(p_payload->'words', '[]'::jsonb)) as w(item)
			where w.item->>'word' = delete_word_id
		) then
			delete from public.word_translation
			where word_translation.word_id = delete_word_id;
		end if;
	end loop;

	for delete_word_id in
		select value
		from jsonb_array_elements_text(coalesce(p_payload->'toDelete'->'words', '[]'::jsonb))
	loop
		delete from public.words
		where words.word_id = delete_word_id;
	end loop;

	for delete_language_id in
		select value
		from jsonb_array_elements_text(coalesce(p_payload->'toDelete'->'languages', '[]'::jsonb))
	loop
		delete from public.word_translation
		where word_translation.language_id = delete_language_id;

		delete from public.language
		where language.language_id = delete_language_id;
	end loop;

	for delete_family_id in
		select value
		from jsonb_array_elements_text(coalesce(p_payload->'toDelete'->'families', '[]'::jsonb))
	loop
		delete from public.word_family
		where word_family.word_family_id = delete_family_id;
	end loop;
end;
$$;
