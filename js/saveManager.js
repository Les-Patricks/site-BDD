import { save } from "./state.js";
import { displayPublishBtn } from "./publish.js";
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
	} catch (error) {
		console.error("Error saving data:", error);
		saveBtn.classList.remove("save-btn__saving");
		saveBtn.textContent = originalText;
	}
});
