import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
	"https://kywafnfxmugjwhykwiae.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d2FmbmZ4bXVnandoeWt3aWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjU0NDUsImV4cCI6MjA4ODEwMTQ0NX0.jjDuqAzsoiAdLXFVxM9xjBesnXfNa-8K9SGCNzDjHNQ",
);

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
