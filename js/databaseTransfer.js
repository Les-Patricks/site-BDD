import { supabase } from "./SupabaseManager.js";

export const publishDatabase = async function () {
	console.log("Publishing database...");
	const { data, error } = await supabase.functions.invoke(
		"publish-to-firebase",
	);
	if (error) {
		console.error("Error publishing database:", error);
	} else {
		console.log("Database published successfully:", data);
	}
};
