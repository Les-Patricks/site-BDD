import { describe, it, expect } from "vitest";

const shouldRunRemoteRollbackTest = process.env.RUN_REMOTE_ROLLBACK_TEST === "1";

const describeIfEnabled = shouldRunRemoteRollbackTest ? describe : describe.skip;

describeIfEnabled("admin-save remote rollback integration", () => {
	it("rolls back globally when a translation FK fails", async () => {
		const supabaseUrl = process.env.SUPABASE_URL || "https://kywafnfxmugjwhykwiae.supabase.co";
		const supabaseAnonKey =
			process.env.SUPABASE_ANON_KEY ||
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d2FmbmZ4bXVnandoeWt3aWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjU0NDUsImV4cCI6MjA4ODEwMTQ0NX0.jjDuqAzsoiAdLXFVxM9xjBesnXfNa-8K9SGCNzDjHNQ";

		const headers = {
			"Content-Type": "application/json",
			apikey: supabaseAnonKey,
			Authorization: `Bearer ${supabaseAnonKey}`,
		};

		const uniqueSuffix = `rollback_${Date.now()}`;
		const wordId = `word_${uniqueSuffix}`;
		const familyId = `family_${uniqueSuffix}`;
		const missingLanguageId = `missing_language_${uniqueSuffix}`;
		const now = new Date().toISOString();

		// This payload is intentionally invalid: translation references a language id
		// that is not created in `languages`, which should fail via FK and rollback.
		const failingPayload = {
			languages: [],
			words: [
				{
					word: wordId,
					traductions: { [missingLanguageId]: "should-fail" },
					date: now,
				},
			],
			families: [
				{
					word_family_id: familyId,
					modification_date: now,
					words: [wordId],
				},
			],
			toDelete: { traductions: [], words: [], languages: [], families: [] },
		};

		const saveResponse = await fetch(`${supabaseUrl}/functions/v1/admin-save`, {
			method: "POST",
			headers,
			body: JSON.stringify(failingPayload),
		});
		const saveBody = await saveResponse.json();

		expect(saveResponse.ok).toBe(false);
		expect(saveBody?.ok).toBe(false);
		expect(saveBody?.code).toBe("ATOMIC_GLOBAL_SAVE_FAILED");

		const bootstrapResponse = await fetch(
			`${supabaseUrl}/functions/v1/admin-bootstrap`,
			{
				method: "POST",
				headers,
			},
		);
		const bootstrapBody = await bootstrapResponse.json();

		expect(bootstrapResponse.ok).toBe(true);
		expect(bootstrapBody?.data?.words?.some((w) => w.word_id === wordId)).toBe(false);
		expect(
			bootstrapBody?.data?.families?.some((f) => f.word_family_id === familyId),
		).toBe(false);
		expect(
			bootstrapBody?.data?.familyAssociations?.some(
				(a) => a.word_id === wordId || a.word_family_id === familyId,
			),
		).toBe(false);
	});
});
