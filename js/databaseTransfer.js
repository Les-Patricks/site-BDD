import { supabase } from "./SupabaseManager.js";
import { notify } from "./notify.js";

export const publishDatabase = async function () {
	console.log("Publishing database...");
	const { error } = await supabase.functions.invoke("publish-to-firebase");
	if (error) {
		let detailedMessage = error.message;
		const context = error?.context;
		if (context) {
			try {
				const payload = await context.json();
				if (payload && typeof payload === "object") {
					const stagePart = payload.stage ? ` [stage=${payload.stage}]` : "";
					const errorPart =
						typeof payload.error === "string"
							? payload.error
							: JSON.stringify(payload);
					detailedMessage = `${errorPart}${stagePart}`;
				}
			} catch {
				// Keep the original message when response body is not JSON.
			}
		}
		notify.error("Echec de la publication : " + detailedMessage);
		throw new Error(detailedMessage);
	} else {
		notify.success("Publication reussie.");
	}
};
