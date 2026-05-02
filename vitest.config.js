import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseConfigStub = path.resolve(
	__dirname,
	"js/tests/supabase-config.stub.js",
);

/** Tests only: `js/supabase-config.js` is gitignored; Node resolution would fail without this. */
function supabaseConfigStubPlugin() {
	return {
		name: "supabase-config-stub",
		enforce: "pre",
		resolveId(id) {
			if (
				id.includes("supabase-config.stub") ||
				id.includes("supabase-config.example")
			) {
				return null;
			}
			if (
				id === "./supabase-config.js" ||
				id.endsWith("/supabase-config.js") ||
				id.endsWith("\\supabase-config.js")
			) {
				return supabaseConfigStub;
			}
			return null;
		},
	};
}

export default defineConfig({
	plugins: [supabaseConfigStubPlugin()],
	resolve: {
		alias: [
			{
				find: "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm",
				replacement: "@supabase/supabase-js",
			},
		],
	},
	test: {
		environment: "node",
		globals: false,
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
			reportsDirectory: "./coverage",
			include: ["js/**/*.js"],
			exclude: ["js/tests/**"],
		},
	},
});
