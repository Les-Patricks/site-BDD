import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			// Redirect CDN imports to the local npm package for tests
			"https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm":
				"@supabase/supabase-js",
		},
	},
	test: {
		environment: "node",
		globals: false,
	},
});
