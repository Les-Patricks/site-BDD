import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore -- URL import is resolved by Deno runtime in Supabase Edge Functions
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

type DenoRuntime = {
	env: { get: (name: string) => string | undefined };
	serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};
declare const Deno: DenoRuntime;

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

const fetchTable = async (table: string) => {
	const { data, error } = await supabase.from(table).select("*").limit(1000);
	if (error) {
		throw error;
	}
	return data ?? [];
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

	const [languages, words, translations, families, familyAssociations] =
		await Promise.all([
			fetchTable("language"),
			fetchTable("words"),
			fetchTable("word_translation"),
			fetchTable("word_family"),
			fetchTable("word_family_association"),
		]);

	return new Response(
		JSON.stringify({
			languages,
			words,
			translations,
			families,
			familyAssociations,
		}),
		{
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		},
	);
});
