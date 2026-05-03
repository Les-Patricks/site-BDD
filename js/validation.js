import { supabase } from "./SupabaseManager.js";
import { notify } from "./notify.js";

const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");

form.addEventListener("submit", async function (event) {
	event.preventDefault();
	const errors = getErrors(emailInput.value, passwordInput.value);
	if (errors.length > 0) {
		notify.warning(errors.join(" "));
		return;
	}

	const { error } = await supabase.auth.signInWithPassword({
		email: emailInput.value,
		password: passwordInput.value,
	});

	if (error) {
		notify.error("Identifiants incorrects.");
		emailInput.parentElement.classList.add("incorrect");
		passwordInput.parentElement.classList.add("incorrect");
		console.error("Erreur de connexion:", error);
	} else {
		globalThis.location.href = "index.html";
	}
});

const getErrors = function (email, password) {
	const errors = [];
	if (!email || email.trim() === "") {
		errors.push("L'email est requis.");
		emailInput.parentElement.classList.add("incorrect");
	}
	if (!password || password.trim() === "") {
		errors.push("Le mot de passe est requis.");
		passwordInput.parentElement.classList.add("incorrect");
	}
	return errors;
};
const allInputs = [emailInput, passwordInput];
allInputs.forEach((input) => {
	input.addEventListener("input", function () {
		input.parentElement.classList.remove("incorrect");
		if (errorMessage) {
			errorMessage.textContent = "";
		}
	});
});
