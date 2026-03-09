import { supabase } from "./SupabaseManager.js";

export const publishDatabase = async function () {
	console.log("Publishing database...");
	const { error } = await supabase.functions.invoke("publish-to-firebase");
	if (error) {
		alert("Error publishing database: " + error.message);
	} else {
		alert("Database published successfully!");
	}
};
