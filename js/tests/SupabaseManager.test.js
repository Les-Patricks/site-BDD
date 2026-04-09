import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock ──────────────────────────────────────────────────

let mockResult = { data: [], error: null };

const queryMock = {
	select: vi.fn().mockReturnThis(),
	insert: vi.fn().mockReturnThis(),
	upsert: vi.fn().mockReturnThis(),
	update: vi.fn().mockReturnThis(),
	delete: vi.fn().mockReturnThis(),
	limit: vi.fn().mockReturnThis(),
	eq: vi.fn().mockReturnThis(),
	neq: vi.fn().mockReturnThis(),
	gt: vi.fn().mockReturnThis(),
	gte: vi.fn().mockReturnThis(),
	lt: vi.fn().mockReturnThis(),
	lte: vi.fn().mockReturnThis(),
	like: vi.fn().mockReturnThis(),
	ilike: vi.fn().mockReturnThis(),
	is: vi.fn().mockReturnThis(),
	in: vi.fn().mockReturnThis(),
	match: vi.fn().mockReturnThis(),
	or: vi.fn().mockReturnThis(),
	order: vi.fn().mockReturnThis(),
	then: vi.fn((resolve) => resolve(mockResult)),
};

vi.mock("@supabase/supabase-js", () => ({
	createClient: vi.fn(() => ({
		from: vi.fn(() => queryMock),
	})),
}));

import {
	fetchFromTable,
	addInTable,
	updateInTable,
	deleteFromTable,
} from "../SupabaseManager.js";

beforeEach(() => {
	mockResult = { data: [], error: null };
	vi.clearAllMocks();
	queryMock.then.mockImplementation((resolve) => resolve(mockResult));
	queryMock.select.mockReturnThis();
	queryMock.insert.mockReturnThis();
	queryMock.upsert.mockReturnThis();
	queryMock.update.mockReturnThis();
	queryMock.delete.mockReturnThis();
	queryMock.limit.mockReturnThis();
	queryMock.eq.mockReturnThis();
	queryMock.neq.mockReturnThis();
	queryMock.gt.mockReturnThis();
	queryMock.gte.mockReturnThis();
	queryMock.lt.mockReturnThis();
	queryMock.lte.mockReturnThis();
	queryMock.like.mockReturnThis();
	queryMock.ilike.mockReturnThis();
	queryMock.is.mockReturnThis();
	queryMock.in.mockReturnThis();
	queryMock.match.mockReturnThis();
	queryMock.or.mockReturnThis();
	queryMock.order.mockReturnThis();
});

// ─── fetchFromTable ────────────────────────────────────────

describe("fetchFromTable", () => {
	it("retourne les données sans erreur", async () => {
		const data = await fetchFromTable("words", "*");
		expect(Array.isArray(data)).toBe(true);
	});

	it("retourne bien les données du mock", async () => {
		mockResult = {
			data: [{ word_id: "chat" }, { word_id: "chien" }],
			error: null,
		};
		const data = await fetchFromTable("words", "*");
		expect(data).toEqual([{ word_id: "chat" }, { word_id: "chien" }]);
	});

	it("lance une erreur si la table est vide", async () => {
		await expect(fetchFromTable("")).rejects.toThrow(
			"fetchFromTable: 'table' est requis.",
		);
	});

	it("propage une erreur Supabase", async () => {
		mockResult = { data: null, error: new Error("Supabase error") };
		await expect(fetchFromTable("words")).rejects.toThrow("Supabase error");
	});

	it("appelle eq() quand une condition eq est fournie", async () => {
		await fetchFromTable("words", "*", 10, {
			where: "eq",
			col: "word_id",
			value: "Test",
		});
		expect(queryMock.eq).toHaveBeenCalledWith("word_id", "Test");
	});

	it("appelle neq() quand une condition neq est fournie", async () => {
		await fetchFromTable("words", "*", 10, {
			where: "neq",
			col: "word_id",
			value: "Test",
		});
		expect(queryMock.neq).toHaveBeenCalledWith("word_id", "Test");
	});

	it("appelle gt() quand une condition gt est fournie", async () => {
		await fetchFromTable("scores", "*", 10, {
			where: "gt",
			col: "score",
			value: 10,
		});
		expect(queryMock.gt).toHaveBeenCalledWith("score", 10);
	});

	it("appelle gte() quand une condition gte est fournie", async () => {
		await fetchFromTable("scores", "*", 10, {
			where: "gte",
			col: "score",
			value: 10,
		});
		expect(queryMock.gte).toHaveBeenCalledWith("score", 10);
	});

	it("appelle lt() quand une condition lt est fournie", async () => {
		await fetchFromTable("scores", "*", 10, {
			where: "lt",
			col: "score",
			value: 10,
		});
		expect(queryMock.lt).toHaveBeenCalledWith("score", 10);
	});

	it("appelle lte() quand une condition lte est fournie", async () => {
		await fetchFromTable("scores", "*", 10, {
			where: "lte",
			col: "score",
			value: 10,
		});
		expect(queryMock.lte).toHaveBeenCalledWith("score", 10);
	});

	it("appelle like() quand une condition like est fournie", async () => {
		await fetchFromTable("words", "*", 10, {
			where: "like",
			col: "word_id",
			value: "Test%",
		});
		expect(queryMock.like).toHaveBeenCalledWith("word_id", "Test%");
	});

	it("appelle ilike() quand une condition ilike est fournie", async () => {
		await fetchFromTable("words", "*", 10, {
			where: "ilike",
			col: "word_id",
			value: "Test%",
		});
		expect(queryMock.ilike).toHaveBeenCalledWith("word_id", "Test%");
	});

	it("appelle is() quand une condition is est fournie", async () => {
		await fetchFromTable("words", "*", 10, {
			where: "is",
			col: "deleted",
			value: null,
		});
		expect(queryMock.is).toHaveBeenCalledWith("deleted", null);
	});

	it("appelle in() quand une condition in est fournie", async () => {
		await fetchFromTable("words", "*", 10, {
			where: "in",
			col: "word_id",
			value: ["chat", "chien"],
		});
		expect(queryMock.in).toHaveBeenCalledWith("word_id", ["chat", "chien"]);
	});

	it("appelle match() quand une condition match est fournie", async () => {
		await fetchFromTable("words", "*", 10, {
			where: "match",
			value: { word_id: "Test" },
		});
		expect(queryMock.match).toHaveBeenCalledWith({ word_id: "Test" });
	});

	it("appelle or() quand une condition or est fournie", async () => {
		await fetchFromTable("words", "*", 10, {
			where: "or",
			value: "word_id.eq.chat,word_id.eq.chien",
		});
		expect(queryMock.or).toHaveBeenCalledWith(
			"word_id.eq.chat,word_id.eq.chien",
		);
	});

	it("appelle order() avec ascending: true par défaut", async () => {
		await fetchFromTable("words", "*", 10, { where: "order", col: "word_id" });
		expect(queryMock.order).toHaveBeenCalledWith("word_id", {
			ascending: true,
		});
	});

	it("appelle order() avec ascending: false quand spécifié", async () => {
		await fetchFromTable("words", "*", 10, {
			where: "order",
			col: "word_id",
			ascending: false,
		});
		expect(queryMock.order).toHaveBeenCalledWith("word_id", {
			ascending: false,
		});
	});

	it("ignore une condition inconnue et affiche un warning", async () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		await fetchFromTable("words", "*", 10, {
			where: "unknown_op",
			col: "word_id",
			value: "Test",
		});
		expect(warnSpy).toHaveBeenCalledWith("Unknown condition: unknown_op");
		warnSpy.mockRestore();
	});

	it("applique plusieurs conditions simultanément", async () => {
		await fetchFromTable(
			"words",
			"*",
			10,
			{ where: "eq", col: "word_id", value: "Test" },
			{ where: "neq", col: "word_id", value: "Other" },
		);
		expect(queryMock.eq).toHaveBeenCalledWith("word_id", "Test");
		expect(queryMock.neq).toHaveBeenCalledWith("word_id", "Other");
	});
});

// ─── addInTable ────────────────────────────────────────────

describe("addInTable", () => {
	it("insère sans erreur", async () => {
		await expect(
			addInTable("words", { word_id: "Test" }),
		).resolves.not.toThrow();
	});

	it("appelle upsert() avec les bonnes valeurs", async () => {
		await addInTable("words", { word_id: "Test" }, "word_id");
		expect(queryMock.upsert).toHaveBeenCalledWith([{ word_id: "Test" }], {
			onConflict: "word_id",
			ignoreDuplicates: false,
		});
	});

	it("n'appelle pas delete()", async () => {
		await addInTable("words", { word_id: "Test" });
		expect(queryMock.delete).not.toHaveBeenCalled();
	});

	it("insère un objet vide sans erreur", async () => {
		await expect(addInTable("words", {})).resolves.not.toThrow();
	});

	it("propage une erreur Supabase", async () => {
		mockResult = { data: null, error: new Error("Insert error") };
		await expect(addInTable("words", { word_id: "Test" })).rejects.toThrow(
			"Insert error",
		);
	});
});

// ─── deleteFromTable ───────────────────────────────────────

describe("deleteFromTable", () => {
	it("supprime sans erreur", async () => {
		await expect(
			deleteFromTable("words", { where: "eq", col: "word_id", value: "Test" }),
		).resolves.not.toThrow();
	});

	it("supprime sans condition sans erreur", async () => {
		await expect(deleteFromTable("words")).resolves.not.toThrow();
	});

	it("appelle delete() sans appeler insert()", async () => {
		await deleteFromTable("words", {
			where: "eq",
			col: "word_id",
			value: "Test",
		});
		expect(queryMock.delete).toHaveBeenCalled();
		expect(queryMock.insert).not.toHaveBeenCalled();
	});

	it("appelle eq() avec les bons paramètres", async () => {
		await deleteFromTable("words", {
			where: "eq",
			col: "word_id",
			value: "Test",
		});
		expect(queryMock.eq).toHaveBeenCalledWith("word_id", "Test");
	});

	it("applique plusieurs conditions simultanément", async () => {
		await deleteFromTable(
			"words",
			{ where: "eq", col: "word_id", value: "chat" },
			{ where: "eq", col: "language_id", value: "fr" },
		);
		expect(queryMock.eq).toHaveBeenCalledTimes(2);
		expect(queryMock.eq).toHaveBeenCalledWith("word_id", "chat");
		expect(queryMock.eq).toHaveBeenCalledWith("language_id", "fr");
	});

	it("propage une erreur Supabase", async () => {
		mockResult = { data: null, error: new Error("Delete error") };
		await expect(
			deleteFromTable("words", { where: "eq", col: "word_id", value: "Test" }),
		).rejects.toThrow("Delete error");
	});
});

// ─── updateInTable ─────────────────────────────────────────

describe("updateInTable", () => {
	it("met à jour sans erreur", async () => {
		await expect(
			updateInTable(
				"words",
				{ word_id: "NewTest" },
				{ where: "eq", col: "word_id", value: "Test" },
			),
		).resolves.not.toThrow();
	});

	it("appelle update() avec les bonnes valeurs", async () => {
		await updateInTable(
			"words",
			{ word_id: "NewTest" },
			{ where: "eq", col: "word_id", value: "Test" },
		);
		expect(queryMock.update).toHaveBeenCalledWith({ word_id: "NewTest" });
	});

	it("appelle eq() avec les bons paramètres", async () => {
		await updateInTable(
			"words",
			{ word_id: "NewTest" },
			{ where: "eq", col: "word_id", value: "Test" },
		);
		expect(queryMock.eq).toHaveBeenCalledWith("word_id", "Test");
	});

	it("propage une erreur Supabase", async () => {
		mockResult = { data: null, error: new Error("Update error") };
		await expect(
			updateInTable(
				"words",
				{ word_id: "NewTest" },
				{ where: "eq", col: "word_id", value: "Test" },
			),
		).rejects.toThrow("Update error");
	});
});
