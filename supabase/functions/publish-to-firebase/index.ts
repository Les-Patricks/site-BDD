// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { fetchFromTable } from "./supabaseClient.ts";

console.log("Hello from Functions!");

Deno.serve(async (req) => {
	const origin = req.headers.get("Origin");
	const allowedOrigins = [
		"bluffers-backoffice.web.app",
		"bluffers-backoffice.firebaseapp.com",
		"site-bdd-97h.pages.dev",
		"http://127.0.0.1:5500",
	];
	console.log(`Requête reçue de l'origine: ${origin}`);

	const allowOrigin = allowedOrigins.includes(origin)
		? origin
		: "bluffers-backoffice.web.app";

	const corsHeaders = {
		"Access-Control-Allow-Origin": allowOrigin,
		"Access-Control-Allow-Headers":
			"authorization, x-client-info, apikey, content-type",
	};
	// Gérer les prérequêtes OPTIONS pour CORS
	if (req.method === "OPTIONS") {
		return new Response("ok", { headers: corsHeaders });
	}
	const words = await fetchFromTable("words");
	const languages = await fetchFromTable("language");
	const families = await fetchFromTable("word_family");
	const wordFamilyAssociations = await fetchFromTable(
		"word_family_association",
	);
	const traduction = await fetchFromTable("word_translation");

	const formattedFamilies = [];
	for (const family of families) {
		const familyObject = {
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

	const formattedWords = [];
	for (const word of words) {
		const wordObject = {
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
			body: JSON.stringify({
				words: formattedWords,
				families: formattedFamilies,
			}),
		},
	);

	return new Response(JSON.stringify({ status: "publish triggered!" }), {
		headers: { ...corsHeaders, "Content-Type": "application/json" },
	});
});
