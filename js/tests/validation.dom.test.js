/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithPassword = vi.hoisted(() => vi.fn());

vi.mock("../SupabaseManager.js", () => ({
	supabase: {
		auth: {
			signInWithPassword,
		},
		functions: { invoke: vi.fn() },
	},
}));

vi.mock("../notify.js", () => ({
	notify: {
		warning: vi.fn(),
		error: vi.fn(),
		success: vi.fn(),
		show: vi.fn(),
	},
}));

import { notify } from "../notify.js";

function mountLoginForm() {
	document.body.innerHTML = `
		<form id="loginForm">
			<p id="errorMessage" class="error-message"></p>
			<div><input type="email" id="email" /></div>
			<div><input type="password" id="password" /></div>
			<button type="submit">Login</button>
		</form>
	`;
}

describe("validation.js DOM wiring", () => {
	beforeEach(() => {
		mountLoginForm();
		vi.clearAllMocks();
		signInWithPassword.mockReset();
		vi.resetModules();
	});

	it("blocks submit and warns when fields are empty", async () => {
		await import("../validation.js");
		document.getElementById("loginForm").requestSubmit();
		expect(notify.warning).toHaveBeenCalledTimes(1);
		expect(notify.warning.mock.calls[0][0]).toMatch(/requis/);
		expect(signInWithPassword).not.toHaveBeenCalled();
	});

	it("shows error notification when Supabase auth fails", async () => {
		signInWithPassword.mockResolvedValue({ error: { message: "Invalid login" } });
		await import("../validation.js");
		document.getElementById("email").value = "a@b.co";
		document.getElementById("password").value = "secret";
		document.getElementById("loginForm").requestSubmit();
		await vi.waitFor(() => expect(notify.error).toHaveBeenCalled());
		expect(notify.error).toHaveBeenCalledWith("Identifiants incorrects.");
	});

	it("redirects after successful sign-in", async () => {
		signInWithPassword.mockResolvedValue({ error: null });
		delete window.location;
		window.location = { href: "" };

		await import("../validation.js");
		document.getElementById("email").value = "a@b.co";
		document.getElementById("password").value = "secret";
		document.getElementById("loginForm").requestSubmit();

		await vi.waitFor(() => {
			expect(window.location.href).toBe("index.html");
		});
	});

	it("clears incorrect class and errorMessage on input", async () => {
		await import("../validation.js");
		const email = document.getElementById("email");
		const password = document.getElementById("password");
		const err = document.getElementById("errorMessage");
		email.parentElement.classList.add("incorrect");
		err.textContent = "x";

		email.dispatchEvent(new Event("input", { bubbles: true }));

		expect(email.parentElement.classList.contains("incorrect")).toBe(false);
		expect(err.textContent).toBe("");
		password.dispatchEvent(new Event("input", { bubbles: true }));
	});
});
