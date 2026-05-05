/**
 * Pure login field checks (no DOM). Used by `validation.js` and unit tests.
 * @param {string} email
 * @param {string} password
 * @returns {{ errors: string[], emailEmpty: boolean, passwordEmpty: boolean }}
 */
export function evaluateLoginFields(email, password) {
	const emailEmpty = !email || email.trim() === "";
	const passwordEmpty = !password || password.trim() === "";
	const errors = [];
	if (emailEmpty) {
		errors.push("L'email est requis.");
	}
	if (passwordEmpty) {
		errors.push("Le mot de passe est requis.");
	}
	return { errors, emailEmpty, passwordEmpty };
}
