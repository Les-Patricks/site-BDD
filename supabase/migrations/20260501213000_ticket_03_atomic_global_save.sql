-- This migration creates a single SQL entrypoint used by `admin-save`.
-- Goal: apply the whole save payload atomically (all-or-nothing).
create or replace function public.admin_save_global_atomic(
	-- Full business payload sent by the frontend through Edge Function.
	p_payload jsonb
)
returns void
language plpgsql
as $$
declare
	-- Iteration variables for each payload section.
	language_item jsonb;
	word_item jsonb;
	family_item jsonb;
	-- IDs used for delete loops.
	delete_word_id text;
	delete_language_id text;
	delete_family_id text;
	-- key/value iterator for dynamic translations object.
	translation_item record;
	-- Local shortcuts extracted from payload objects.
	word_id text;
	family_id text;
begin
	-- 1) Upsert languages
	--    Reads payload.languages array and upserts each row.
	--    `coalesce(..., '[]')` prevents errors when array is missing/null.
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

	-- 2) Upsert words and their translations
	--    Each word is upserted first, then its translations are synchronized.
	for word_item in
		select value from jsonb_array_elements(coalesce(p_payload->'words', '[]'::jsonb))
	loop
		word_id := word_item->>'word';

		insert into public.words (word_id, modification_date)
		values (
			word_id,
			(word_item->>'date')::timestamptz
		)
		on conflict (word_id)
		do update set modification_date = excluded.modification_date;

		-- Optional full reset of one word's translations.
		-- If the word id appears in toDelete.traductions, we wipe old rows first.
		if exists (
			select 1
			from jsonb_array_elements_text(
				coalesce(p_payload->'toDelete'->'traductions', '[]'::jsonb)
			) as t(word_id_to_delete)
			where t.word_id_to_delete = word_id
		) then
			delete from public.word_translation
			where word_translation.word_id = word_id;
		end if;

		-- Upsert each translation entry from word_item.traductions object.
		-- `jsonb_each` converts {"fr":"chat","en":"cat"} to key/value rows.
		for translation_item in
			select key as language_id, value as translation_value
			from jsonb_each(coalesce(word_item->'traductions', '{}'::jsonb))
		loop
			insert into public.word_translation (word_id, language_id, value)
			values (
				word_id,
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

	-- 3) Upsert families and associations
	--    Strategy: replace association list for each family with payload source of truth.
	for family_item in
		select value from jsonb_array_elements(coalesce(p_payload->'families', '[]'::jsonb))
	loop
		family_id := family_item->>'word_family_id';

		insert into public.word_family (word_family_id, modification_date)
		values (
			family_id,
			(family_item->>'modification_date')::timestamptz
		)
		on conflict (word_family_id)
		do update set modification_date = excluded.modification_date;

		delete from public.word_family_association
		where word_family_association.word_family_id = family_id;

		insert into public.word_family_association (word_id, word_family_id)
		select word_id_value, family_id
		from jsonb_array_elements_text(coalesce(family_item->'words', '[]'::jsonb)) as words(word_id_value)
		on conflict (word_id, word_family_id) do nothing;
	end loop;

	-- 4) Delete standalone translation removals (words not in current payload)
	--    If a word is in payload.words, it was already handled above.
	--    Otherwise we delete all translations for that word id here.
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

	-- 5) Delete words
	--    Assumes DB-level FK strategy allows this order in your schema.
	for delete_word_id in
		select value
		from jsonb_array_elements_text(coalesce(p_payload->'toDelete'->'words', '[]'::jsonb))
	loop
		delete from public.words
		where words.word_id = delete_word_id;
	end loop;

	-- 6) Delete languages (translations first)
	--    Avoids FK violations by removing dependent translations beforehand.
	for delete_language_id in
		select value
		from jsonb_array_elements_text(coalesce(p_payload->'toDelete'->'languages', '[]'::jsonb))
	loop
		delete from public.word_translation
		where word_translation.language_id = delete_language_id;

		delete from public.language
		where language.language_id = delete_language_id;
	end loop;

	-- 7) Delete families
	for delete_family_id in
		select value
		from jsonb_array_elements_text(coalesce(p_payload->'toDelete'->'families', '[]'::jsonb))
	loop
		delete from public.word_family
		where word_family.word_family_id = delete_family_id;
	end loop;
end;
$$;

-- Security hardening:
-- - No public/anon/authenticated execution.
-- - Only service_role (used by Edge Function) can execute this function.
revoke all on function public.admin_save_global_atomic(jsonb) from public;
revoke all on function public.admin_save_global_atomic(jsonb) from anon;
revoke all on function public.admin_save_global_atomic(jsonb) from authenticated;
grant execute on function public.admin_save_global_atomic(jsonb) to service_role;
