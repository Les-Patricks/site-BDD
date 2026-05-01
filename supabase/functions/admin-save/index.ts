import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore -- URL import is resolved by Deno runtime in Supabase Edge Functions
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

type DenoRuntime = {
	env: { get: (name: string) => string | undefined };
	serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};
declare const Deno: DenoRuntime;

type SavePayload = {
	languages?: Array<{
		language_id: string;
		name: string;
		modification_date: string;
	}>;
	words?: Array<{
		word: string;
		traductions: Record<string, string | null>;
		date: string;
	}>;
	families?: Array<{
		word_family_id: string;
		modification_date: string;
		words: string[];
	}>;
	toDelete?: {
		traductions?: string[];
		words?: string[];
		languages?: string[];
		families?: string[];
	};
};

const validateSavePayload = (payload: unknown): SavePayload => {
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Invalid payload: expected JSON object");
	}
	const typed = payload as SavePayload;
	if (typed.languages !== undefined && !Array.isArray(typed.languages)) {
		throw new Error("Invalid payload: languages must be an array");
	}
	if (typed.words !== undefined && !Array.isArray(typed.words)) {
		throw new Error("Invalid payload: words must be an array");
	}
	if (typed.families !== undefined && !Array.isArray(typed.families)) {
		throw new Error("Invalid payload: families must be an array");
	}
	if (typed.toDelete !== undefined) {
		if (typeof typed.toDelete !== "object" || typed.toDelete === null) {
			throw new Error("Invalid payload: toDelete must be an object");
		}
		const { traductions, words, languages, families } = typed.toDelete;
		if (traductions !== undefined && !Array.isArray(traductions)) {
			throw new Error("Invalid payload: toDelete.traductions must be an array");
		}
		if (words !== undefined && !Array.isArray(words)) {
			throw new Error("Invalid payload: toDelete.words must be an array");
		}
		if (languages !== undefined && !Array.isArray(languages)) {
			throw new Error("Invalid payload: toDelete.languages must be an array");
		}
		if (families !== undefined && !Array.isArray(families)) {
			throw new Error("Invalid payload: toDelete.families must be an array");
		}
	}
	return typed;
};

const supabaseUrl = "https://kywafnfxmugjwhykwiae.supabase.co";
const serviceKey = Deno.env.get("SERVICE_KEY");
if (!serviceKey) {
	throw new Error("SERVICE_KEY manquant dans les variables d'environnement");
}
const supabase = createClient(supabaseUrl, serviceKey);

const allowedOrigins = [
	"https://bluffers-backoffice.web.app",
	"https://bluffers-backoffice.firebaseapp.com",
	"https://site-bdd-97h.pages.dev",
	"http://127.0.0.1:5500",
];

const isAllowedOrigin = (origin: string | null) =>
	origin !== null && allowedOrigins.includes(origin);

const buildCorsHeaders = (origin: string | null) => {
	const allowOrigin = origin && isAllowedOrigin(origin)
		? origin
		: "https://bluffers-backoffice.web.app";
	return {
		"Access-Control-Allow-Origin": allowOrigin,
		"Access-Control-Allow-Headers":
			"authorization, x-client-info, apikey, content-type",
	};
};

const applySave = async (payload: SavePayload) => {
	const languages = payload.languages ?? [];
	const words = payload.words ?? [];
	const families = payload.families ?? [];
	const toDelete = payload.toDelete ?? {};

	if (languages.length > 0) {
		const { error } = await supabase.from("language").upsert(languages, {
			onConflict: "language_id",
			ignoreDuplicates: false,
		});
		if (error) throw error;
	}

	for (const wordData of words) {
		const { error: wordError } = await supabase.from("words").upsert(
			[
				{
					word_id: wordData.word,
					modification_date: wordData.date,
				},
			],
			{ onConflict: "word_id", ignoreDuplicates: false },
		);
		if (wordError) throw wordError;

		const traductionsEntries = Object.entries(wordData.traductions ?? {});
		if (traductionsEntries.length > 0) {
			const rows = traductionsEntries.map(([language_id, value]) => ({
				word_id: wordData.word,
				language_id,
				value,
			}));
			const { error: translationError } = await supabase
				.from("word_translation")
				.upsert(rows, {
					onConflict: "word_id, language_id",
					ignoreDuplicates: false,
				});
			if (translationError) throw translationError;
		}
	}

	for (const familyData of families) {
		const { error: familyError } = await supabase.from("word_family").upsert(
			[
				{
					word_family_id: familyData.word_family_id,
					modification_date: familyData.modification_date,
				},
			],
			{ onConflict: "word_family_id", ignoreDuplicates: false },
		);
		if (familyError) throw familyError;

		const associationRows = (familyData.words ?? []).map((word) => ({
			word_id: word,
			word_family_id: familyData.word_family_id,
		}));
		if (associationRows.length > 0) {
			const { error: associationError } = await supabase
				.from("word_family_association")
				.upsert(associationRows, {
					onConflict: "word_id, word_family_id",
					ignoreDuplicates: false,
				});
			if (associationError) throw associationError;
		}
	}

	for (const word of toDelete.traductions ?? []) {
		const { error } = await supabase.from("word_translation").delete().eq(
			"word_id",
			word,
		);
		if (error) throw error;
	}
	for (const word of toDelete.words ?? []) {
		const { error } = await supabase.from("words").delete().eq("word_id", word);
		if (error) throw error;
	}
	for (const language of toDelete.languages ?? []) {
		const { error: translationError } = await supabase
			.from("word_translation")
			.delete()
			.eq("language_id", language);
		if (translationError) throw translationError;

		const { error: languageError } = await supabase
			.from("language")
			.delete()
			.eq("language_id", language);
		if (languageError) throw languageError;
	}
	for (const family of toDelete.families ?? []) {
		const { error } = await supabase.from("word_family").delete().eq(
			"word_family_id",
			family,
		);
		if (error) throw error;
	}
};

Deno.serve(async (req) => {
	const origin = req.headers.get("Origin");
	const corsHeaders = buildCorsHeaders(origin);
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}
	if (origin !== null && !isAllowedOrigin(origin)) {
		return new Response(JSON.stringify({ error: "origin not allowed" }), {
			status: 403,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}

	try {
		const payload = validateSavePayload(await req.json());
		await applySave(payload);
		return new Response(JSON.stringify({ status: "ok" }), {
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "unknown error";
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}
});
