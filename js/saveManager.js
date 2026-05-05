import { save } from "./state.js";
import { displayPublishBtn } from "./publish.js";
import { notify } from "./notify.js";
const saveBtn = document.getElementById("saveBtn");

saveBtn.addEventListener("click", async () => {
	const originalText = saveBtn.textContent;
	try {
		saveBtn.classList.add("save-btn__saving");
		saveBtn.textContent = "Saving...";
		await save();

		saveBtn.classList.remove("save-btn__saving");
		saveBtn.textContent = originalText;
		displayPublishBtn();
		notify.success("Donnees enregistrees.", { durationMs: 2500 });
	} catch (error) {
		console.error("Error saving data:", error);
		const msg = error?.message ?? String(error);
		notify.error(`Enregistrement impossible : ${msg}`);
		saveBtn.classList.remove("save-btn__saving");
		saveBtn.textContent = originalText;
	}
});
