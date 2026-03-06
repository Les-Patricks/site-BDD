// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
	apiKey: "AIzaSyASZFPEEZfd78Rnm5yAkN12HHZYsAUYk-4",
	authDomain: "bluffers-74d8a.firebaseapp.com",
	databaseURL:
		"https://bluffers-74d8a-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "bluffers-74d8a",
	storageBucket: "bluffers-74d8a.firebasestorage.app",
	messagingSenderId: "612549310180",
	appId: "1:612549310180:web:8b288cd0ceed08648d5ef1",
	measurementId: "G-ZR3NM68F0V",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

export const publishDatabase = async function () {
	console.log("Publishing database...");
};
