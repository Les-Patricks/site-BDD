import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const readSource = async (relativePath) => {
	const absolutePath = path.resolve(process.cwd(), relativePath);
	return await readFile(absolutePath, "utf8");
};

describe("Endpoints contract (mini-spec)", () => {
	describe("Nominal", () => {
		it("charge initial via endpoint metier admin-bootstrap", async () => {
			const mainSource = await readSource("js/main.js");
			expect(mainSource).toContain('functions.invoke("admin-bootstrap")');
		});

		it("save() delegue la persistance a admin-save", async () => {
			const stateSource = await readSource("js/state.js");
			expect(stateSource).toContain('functions.invoke("admin-save"');
		});

		it("publish() conserve l'invocation de publish-to-firebase", async () => {
			const databaseTransferSource = await readSource("js/databaseTransfer.js");
			expect(databaseTransferSource).toContain(
				'functions.invoke("publish-to-firebase")',
			);
		});
	});

	describe("Alternatifs", () => {
		it("navigation tabs + save passe par la couche metier", async () => {
			const mainSource = await readSource("js/main.js");
			const stateSource = await readSource("js/state.js");

			expect(mainSource).toContain("wordFamilyBtn.addEventListener");
			expect(mainSource).toContain("wordBtn.addEventListener");
			expect(mainSource).toContain("languagesBtn.addEventListener");
			expect(stateSource).toContain('functions.invoke("admin-save"');
		});
	});

	describe("Limites", () => {
		it("save no-op ne depend pas des helpers CRUD table", async () => {
			const stateSource = await readSource("js/state.js");
			expect(stateSource).not.toContain("addInTable(");
			expect(stateSource).not.toContain("deleteFromTable(");
		});
	});

	describe("Erreur", () => {
		it("aucun fallback CRUD direct en cas d'erreur endpoint", async () => {
			const mainSource = await readSource("js/main.js");
			const stateSource = await readSource("js/state.js");

			expect(mainSource).not.toContain("fetchFromTable(");
			expect(stateSource).not.toContain("addWordsInDataBase(");
			expect(stateSource).not.toContain("addLanguagesInTable(");
			expect(stateSource).not.toContain("deleteFromTable(");
		});
	});

	describe("Contrats d'interface", () => {
		it("main.js et state.js n'exposent plus de CRUD direct table", async () => {
			const mainSource = await readSource("js/main.js");
			const stateSource = await readSource("js/state.js");

			expect(mainSource).not.toContain("fetchFromTable(");
			expect(stateSource).not.toContain("fetchFromTable(");
			expect(stateSource).not.toContain("addInTable(");
			expect(stateSource).not.toContain("deleteFromTable(");
		});

		it("publish-to-firebase valide explicitement le contrat payload", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain("validatePublishPayload(");
		});

		it("publish centralise la validation dans validatePublishPayload", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain(
				"function validatePublishPayload(",
			);
		});

		it("admin-save rejette explicitement les origins non autorisees", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain("origin not allowed");
			expect(adminSaveSource).toContain("status: 403");
		});

		it("admin-save centralise la whitelist CORS via isAllowedOrigin", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain("../_shared/corsOrigins.ts");
		});

		it("admin-bootstrap rejette explicitement les origins non autorisees", async () => {
			const adminBootstrapSource = await readSource(
				"supabase/functions/admin-bootstrap/index.ts",
			);
			expect(adminBootstrapSource).toContain("origin not allowed");
			expect(adminBootstrapSource).toContain("status: 403");
		});

		it("admin-bootstrap centralise la whitelist CORS via isAllowedOrigin", async () => {
			const adminBootstrapSource = await readSource(
				"supabase/functions/admin-bootstrap/index.ts",
			);
			expect(adminBootstrapSource).toContain("../_shared/corsOrigins.ts");
		});

		it("admin-save gere explicitement la pre-requete OPTIONS", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain('if (req.method === "OPTIONS")');
			expect(adminSaveSource).toContain('return new Response("ok"');
		});

		it("admin-bootstrap gere explicitement la pre-requete OPTIONS", async () => {
			const adminBootstrapSource = await readSource(
				"supabase/functions/admin-bootstrap/index.ts",
			);
			expect(adminBootstrapSource).toContain('if (req.method === "OPTIONS")');
			expect(adminBootstrapSource).toContain('return new Response("ok"');
		});

		it("publish gere explicitement la pre-requete OPTIONS", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain('if (req.method === "OPTIONS")');
			expect(publishFunctionSource).toContain('return new Response("ok"');
		});

		it("publish utilise isAllowedOrigin pour calculer allowOrigin", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain("isAllowedOrigin(origin)");
		});

		it("admin-bootstrap expose une erreur CORS au format JSON", async () => {
			const adminBootstrapSource = await readSource(
				"supabase/functions/admin-bootstrap/index.ts",
			);
			expect(adminBootstrapSource).toContain("Content-Type\": \"application/json");
		});

		it("admin-save expose une erreur CORS au format JSON", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain("Content-Type\": \"application/json");
		});

		it("admin-save valide explicitement le format du payload", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain(
				"Invalid payload: expected JSON object",
			);
			expect(adminSaveSource).toContain(
				"Invalid payload: toDelete must be an object",
			);
		});

		it("admin-save valide que languages est un tableau", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain(
				"Invalid payload: languages must be an array",
			);
		});

		it("admin-save valide que words est un tableau", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain(
				"Invalid payload: words must be an array",
			);
		});

		it("admin-save valide que families est un tableau", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain(
				"Invalid payload: families must be an array",
			);
		});

		it("admin-save valide toDelete.traductions en tableau", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain(
				"Invalid payload: toDelete.traductions must be an array",
			);
		});

		it("admin-save valide toDelete.words en tableau", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain(
				"Invalid payload: toDelete.words must be an array",
			);
		});

		it("admin-save valide toDelete.languages en tableau", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain(
				"Invalid payload: toDelete.languages must be an array",
			);
		});

		it("admin-save valide toDelete.families en tableau", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain(
				"Invalid payload: toDelete.families must be an array",
			);
		});

		it("publish valide que family.words contient uniquement des strings", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain(
				"Invalid publish payload: family words entries must be strings",
			);
		});

		it("publish valide que chaque family expose un words array", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain(
				"Invalid publish payload: each family must have a words array",
			);
		});

		it("publish valide que chaque family contient un id string", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain(
				"Invalid publish payload: each family must have a string id",
			);
		});

		it("publish valide que chaque family est un objet", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain(
				"Invalid publish payload: each family must be an object",
			);
		});

		it("publish valide que words et families sont des tableaux", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain(
				"Invalid publish payload: words/families must be arrays",
			);
		});

		it("publish valide que les valeurs de traduction sont string ou null", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain(
				"Invalid publish payload: translation values must be string or null",
			);
		});

		it("publish valide que chaque word contient un id string", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain(
				"Invalid publish payload: each word must have a string id",
			);
		});

		it("publish valide que chaque word est un objet", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain(
				"Invalid publish payload: each word must be an object",
			);
		});

		it("publish echoue explicitement si SECRET_TOKEN est absente", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain(
				"SECRET_TOKEN manquant dans les variables d'environnement",
			);
		});

		it("publish supabase client echoue explicitement si SERVICE_KEY est absente", async () => {
			const publishSupabaseClientSource = await readSource(
				"supabase/functions/publish-to-firebase/supabaseClient.ts",
			);
			expect(publishSupabaseClientSource).toContain(
				"SERVICE_KEY manquant dans les variables d'environnement",
			);
		});

		it("publish rejette explicitement les origins non autorisees", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain("origin not allowed");
			expect(publishFunctionSource).toContain("status: 403");
		});

		it("publish centralise la whitelist CORS via isAllowedOrigin", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain("../_shared/corsOrigins.ts");
		});

		it("publish expose une erreur CORS au format JSON", async () => {
			const publishFunctionSource = await readSource(
				"supabase/functions/publish-to-firebase/index.ts",
			);
			expect(publishFunctionSource).toContain("Content-Type\": \"application/json");
		});

		it("admin-save echoue explicitement si SERVICE_KEY est absente", async () => {
			const adminSaveSource = await readSource(
				"supabase/functions/admin-save/index.ts",
			);
			expect(adminSaveSource).toContain(
				"SERVICE_KEY manquant dans les variables d'environnement",
			);
		});

		it("admin-bootstrap echoue explicitement si SERVICE_KEY est absente", async () => {
			const adminBootstrapSource = await readSource(
				"supabase/functions/admin-bootstrap/index.ts",
			);
			expect(adminBootstrapSource).toContain(
				"SERVICE_KEY manquant dans les variables d'environnement",
			);
		});
	});
});
