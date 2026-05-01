// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { fetchFromTable } from "./supabaseClient.ts";

console.log("Hello from Functions!");

type DenoRuntime = {
	env: { get: (name: string) => string | undefined };
	serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};
declare const Deno: DenoRuntime;

type PublishWord = { id: string; [languageId: string]: string | null };
type PublishFamily = { id: string; words: string[] };

function validatePublishPayload(payload: { words: unknown; families: unknown }) {
	if (!Array.isArray(payload.words) || !Array.isArray(payload.families)) {
		throw new Error("Invalid publish payload: words/families must be arrays");
	}

	for (const word of payload.words) {
		if (typeof word !== "object" || word === null) {
			throw new Error("Invalid publish payload: each word must be an object");
		}
		if (!("id" in word) || typeof word.id !== "string") {
			throw new Error("Invalid publish payload: each word must have a string id");
		}
		for (const [key, value] of Object.entries(word)) {
			if (key === "id") continue;
			if (typeof value !== "string" && value !== null) {
				throw new Error(
					"Invalid publish payload: translation values must be string or null",
				);
			}
		}
	}

	for (const family of payload.families) {
		if (typeof family !== "object" || family === null) {
			throw new Error("Invalid publish payload: each family must be an object");
		}
		if (!("id" in family) || typeof family.id !== "string") {
			throw new Error(
				"Invalid publish payload: each family must have a string id",
			);
		}
		if (!("words" in family) || !Array.isArray(family.words)) {
			throw new Error(
				"Invalid publish payload: each family must have a words array",
			);
		}
		if (!family.words.every((wordId) => typeof wordId === "string")) {
			throw new Error(
				"Invalid publish payload: family words entries must be strings",
			);
		}
	}
}

Deno.serve(async (req) => {
	const origin = req.headers.get("Origin");
	const allowedOrigins = [
		"https://bluffers-backoffice.web.app",
		"https://bluffers-backoffice.firebaseapp.com",
		"https://site-bdd-97h.pages.dev",
		"http://127.0.0.1:5500",
	];
	const isAllowedOrigin = (value: string | null) =>
		value !== null && allowedOrigins.includes(value);

	const allowOrigin: string =
		isAllowedOrigin(origin)
		? origin!
		: "https://bluffers-backoffice.web.app";

	const corsHeaders = {
		"Access-Control-Allow-Origin": allowOrigin,
		"Access-Control-Allow-Headers":
			"authorization, x-client-info, apikey, content-type",
	};
	// Gérer les prérequêtes OPTIONS pour CORS
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}
	if (origin !== null && !isAllowedOrigin(origin)) {
		return new Response(JSON.stringify({ error: "origin not allowed" }), {
			status: 403,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	}
	const words = await fetchFromTable("words");
	const families = await fetchFromTable("word_family");
	const wordFamilyAssociations = await fetchFromTable(
		"word_family_association",
	);
	const traduction = await fetchFromTable("word_translation");

	const formattedFamilies: PublishFamily[] = [];
	for (const family of families) {
		const familyObject: PublishFamily = {
			id: family.word_family_id,
			words: [],
		};
		for (const { word_id, word_family_id } of wordFamilyAssociations) {
			if (word_family_id === family.word_family_id) {
				familyObject.words.push(word_id);
			}
		}
		formattedFamilies.push(familyObject);
	}

	const formattedWords: PublishWord[] = [];
	for (const word of words) {
		const wordObject: PublishWord = {
			id: word.word_id,
		};
		for (const trad of traduction) {
			if (trad.word_id === word.word_id) {
				wordObject[trad.language_id] = trad.value;
			}
		}
		formattedWords.push(wordObject);
	}

	const SECRET_TOKEN = Deno.env.get("SECRET_TOKEN");
	if (!SECRET_TOKEN) {
		throw new Error("SECRET_TOKEN manquant dans les variables d'environnement");
	}

	await fetch(
		"https://us-central1-bluffers-74d8a.cloudfunctions.net/publishWords",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${SECRET_TOKEN}`,
			},
			body: JSON.stringify(
				(() => {
					const payload = {
						words: formattedWords,
						families: formattedFamilies,
					};
					validatePublishPayload(payload);
					return payload;
				})(),
			),
		},
	);

	return new Response(JSON.stringify({ status: "publish triggered!" }), {
		headers: { ...corsHeaders, "Content-Type": "application/json" },
	});
});
