import { describe, expect, it } from "vitest";
import { evaluateLoginFields } from "../loginValidation.js";

describe("evaluateLoginFields", () => {
	it("flags both fields when email and password are empty", () => {
		const r = evaluateLoginFields("", "");
		expect(r.emailEmpty).toBe(true);
		expect(r.passwordEmpty).toBe(true);
		expect(r.errors).toEqual([
			"L'email est requis.",
			"Le mot de passe est requis.",
		]);
	});

	it("flags only email when password is set", () => {
		const r = evaluateLoginFields("   ", "x");
		expect(r.emailEmpty).toBe(true);
		expect(r.passwordEmpty).toBe(false);
		expect(r.errors).toEqual(["L'email est requis."]);
	});

	it("flags only password when email is set", () => {
		const r = evaluateLoginFields("a@b.co", "");
		expect(r.emailEmpty).toBe(false);
		expect(r.passwordEmpty).toBe(true);
		expect(r.errors).toEqual(["Le mot de passe est requis."]);
	});

	it("returns no errors when both fields are non-empty", () => {
		const r = evaluateLoginFields("a@b.co", "secret");
		expect(r.errors).toEqual([]);
		expect(r.emailEmpty).toBe(false);
		expect(r.passwordEmpty).toBe(false);
	});
});
