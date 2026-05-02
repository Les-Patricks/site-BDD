import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore -- URL import is resolved by Deno runtime in Supabase Edge Functions
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { isAllowedOrigin, resolveAllowedOrigin } from "../_shared/corsOrigins.ts";

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

type SaveResponse =
	| { ok: true; code: "SAVE_OK" }
	| { ok: false; code: string; message: string };

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

const buildCorsHeaders = (origin: string | null) => {
	const allowOrigin = resolveAllowedOrigin(origin);
	return {
		"Access-Control-Allow-Origin": allowOrigin,
		"Access-Control-Allow-Headers":
			"authorization, x-client-info, apikey, content-type",
	};
};

const applySave = async (payload: SavePayload): Promise<SaveResponse> => {
	const { error } = await supabase.rpc("admin_save_and_mark_pending", {
		p_payload: payload,
	});
	if (error) {
		return {
			ok: false,
			code: "ATOMIC_GLOBAL_SAVE_FAILED",
			message: error.message,
		};
	}
	return { ok: true, code: "SAVE_OK" };
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
		const result = await applySave(payload);
		if (!result.ok) {
			return new Response(JSON.stringify(result), {
				status: 500,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});
		}
		return new Response(JSON.stringify(result), {
			headers: { ...corsHeaders, "Content-Type": "application/json" },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "unknown error";
		return new Response(
			JSON.stringify({
				ok: false,
				code: "UNEXPECTED_ERROR",
				message,
			}),
			{
			status: 500,
			headers: { ...corsHeaders, "Content-Type": "application/json" },
			},
		);
	}
});
