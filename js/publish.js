import { publishDatabase } from "./databaseTransfer.js";

const publishBtn = document.getElementById("publishBtn");
const publishConfirmPopup = document.getElementById("publishConfirmPopup");
const confirmPublishBtn = document.getElementById("confirmPublishBtn");
const cancelPublishBtn = document.getElementById("cancelPublishBtn");
publishBtn.addEventListener("click", () => {
	publishConfirmPopup.classList.add("publish__popup--visible");
});
cancelPublishBtn.addEventListener("click", () => {
	publishConfirmPopup.classList.remove("publish__popup--visible");
});
confirmPublishBtn.addEventListener("click", async () => {
	await publishDatabase();
	publishConfirmPopup.classList.remove("publish__popup--visible");
});
