const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

setGlobalOptions({ maxInstances: 10 });

const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore(undefined, "bluffersbdd");

exports.publishWords = onRequest(async (req, res) => {
	// Prérequette pour vérifier que la requete est autorisée et pour permettre les requetes CORS
	res.set(
		"Access-Control-Allow-Origin",
		"https://kywafnfxmugjwhykwiae.supabase.co",
	); // Permet d'accepter des requetes de uniquement supabase
	if (req.method === "OPTIONS") {
		// Sert à demander au navigateur si la requete est autorisée avant de faire la requete POST
		res.set("Access-Control-Allow-Headers", "Content-Type,Authorization"); // Sert à répondre à la requete OPTIONS en indiquant que le header Content-Type et Authorization sont autorisés
		res.status(204).send(""); // Finir la requete OPTIONS sans envoyer de données
		return;
	}

	const SECRET_TOKEN = process.env.SECRET_TOKEN;

	const authHeader = req.headers.authorization;

	// 3. Vérifier que la clé est présente et correcte
	if (!authHeader || authHeader !== `Bearer ${SECRET_TOKEN}`) {
		logger.warn("Tentative d'accès non autorisée");
		res.status(401).json({ error: "Accès refusé" });
		return;
	}

	try {
		const words = req.body.words;
		const families = req.body.families;

		logger.info(
			`Publish démarré — ${words?.length ?? 0} mots, ${families?.length ?? 0} familles`,
		);

		if (!words || !Array.isArray(words)) {
			logger.warn("Payload invalide: words manquant ou invalide");
			res.status(400).json({ error: "words manquant ou invalide" });
			return;
		}

		if (!families || !Array.isArray(families)) {
			logger.warn("Payload invalide: families manquant ou invalide");
			res.status(400).json({ error: "families manquants ou invalides" });
			return;
		}

		// Suppression de l'ancienne collection Words et WordFamilies
		logger.info("Suppression de l'ancienne collection Words & WordFamilies...");
		const deleteBatch = db.batch();
		const snapshot = await db.collection("Words").get();
		const familySnapshot = await db.collection("WordFamilies").get();
		familySnapshot.forEach((doc) => {
			deleteBatch.delete(doc.ref);
		});
		snapshot.forEach((doc) => {
			deleteBatch.delete(doc.ref);
		});
		await deleteBatch.commit();
		logger.info(`Suppression réussie — ${snapshot.size} documents supprimés`);

		// Création de la collection Words
		logger.info("Écriture des nouveaux documents...");
		const writingBatch = db.batch();
		for (const word of words) {
			if (!word.id) {
				logger.error(`word.id manquant: ${JSON.stringify(word)}`);
				res
					.status(400)
					.json({ error: `word.id manquant: ${JSON.stringify(word)}` });
				return;
			}
			const ref = db.collection("Words").doc(String(word.id));
			const wordData = {};
			for (const [key, value] of Object.entries(word)) {
				if (key !== "id") {
					wordData[key] = value;
				}
			}
			writingBatch.set(ref, wordData);
		}
		for (const family of families) {
			if (!family.id) {
				logger.error(`family.id manquant: ${JSON.stringify(family)}`);
				res
					.status(400)
					.json({ error: `family.id manquant: ${JSON.stringify(family)}` });
				return;
			}
			const ref = db.collection("WordFamilies").doc(String(family.id));
			const familyData = {};
			familyData["IDs"] = [];
			for (const word of family.words) {
				familyData["IDs"].push(word);
			}
			writingBatch.set(ref, familyData);
		}

		await writingBatch.commit();
		logger.info(
			`Écriture réussie — ${words.length} mots et ${families.length} familles publiés`,
		);

		res.json({ status: "success", count: words.length });
	} catch (error) {
		logger.error("Erreur lors du publish", {
			message: error.message,
			stack: error.stack,
		});
		res.status(500).json({ error: error.message, stack: error.stack });
	}
});
