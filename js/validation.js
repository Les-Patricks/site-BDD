import { supabase } from "./SupabaseManager.js";
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");

form.addEventListener("submit", async function (event) {
	event.preventDefault();
	const errors = getErrors(emailInput.value, passwordInput.value);
	if (errors.length > 0) {
		errorMessage.textContent = errors.join(" ");
		return;
	}

	const { data, error } = await supabase.auth.signInWithPassword({
		email: emailInput.value,
		password: passwordInput.value,
	});

	if (error) {
		// Supabase dit non (Mauvais mot de passe ou email)
		errorMessage.textContent = "Identifiants incorrects.";
		errorMessage.style.color = "red";
		emailInput.parentElement.classList.add("incorrect");
		passwordInput.parentElement.classList.add("incorrect");
		console.error("Erreur de connexion:", error);
	} else {
		// Supabase dit OUI ! L'utilisateur est connecté !
		// Facultatif : plus besoin du localStorage manuel, Supabase gère l'état de session tout seul !

		// 2. On redirige vers l'index.html
		window.location.href = "index.html";
	}
});

const getErrors = function (email, password) {
	const errors = [];
	if (!email || email.trim() === "") {
		errors.push("Email is required.");
		emailInput.parentElement.classList.add("incorrect");
	}
	if (!password || password.trim() === "") {
		errors.push("Password is required.");
		passwordInput.parentElement.classList.add("incorrect");
	}
	return errors;
};
const allInputs = [emailInput, passwordInput];
allInputs.forEach((input) => {
	input.addEventListener("input", function () {
		input.parentElement.classList.remove("incorrect");
		errorMessage.textContent = "";
	});
});
