export const DEFAULT_ALLOWED_ORIGIN = "https://bluffers-backoffice.web.app";

export const ALLOWED_ORIGINS = [
	DEFAULT_ALLOWED_ORIGIN,
	"https://bluffers-backoffice.firebaseapp.com",
	"https://bluffers-backoffice--dev-kni2oqbp.web.app",
	"https://site-bdd-97h.pages.dev",
	"http://127.0.0.1:5500",
];

export const isAllowedOrigin = (origin: string | null) =>
	origin !== null && ALLOWED_ORIGINS.includes(origin);

export const resolveAllowedOrigin = (origin: string | null) =>
	origin !== null && isAllowedOrigin(origin) ? origin : DEFAULT_ALLOWED_ORIGIN;
