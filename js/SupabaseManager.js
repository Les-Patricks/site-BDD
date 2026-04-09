//import { createClient } from '@supabase/supabase-js'
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://kywafnfxmugjwhykwiae.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d2FmbmZ4bXVnandoeWt3aWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjU0NDUsImV4cCI6MjA4ODEwMTQ0NX0.jjDuqAzsoiAdLXFVxM9xjBesnXfNa-8K9SGCNzDjHNQ";
export const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_LIMIT = 1000;

// ─── Generalist functions ──────────────────────────────────

const conditionHandlers = {
	eq: (rq, c) => rq.eq(c.col, c.value),
	neq: (rq, c) => rq.neq(c.col, c.value),
	gt: (rq, c) => rq.gt(c.col, c.value),
	gte: (rq, c) => rq.gte(c.col, c.value),
	lt: (rq, c) => rq.lt(c.col, c.value),
	lte: (rq, c) => rq.lte(c.col, c.value),
	like: (rq, c) => rq.like(c.col, c.value),
	ilike: (rq, c) => rq.ilike(c.col, c.value),
	is: (rq, c) => rq.is(c.col, c.value),
	in: (rq, c) => rq.in(c.col, c.value),
	match: (rq, c) => rq.match(c.value),
	or: (rq, c) => rq.or(c.value),
	order: (rq, c) => rq.order(c.col, { ascending: c.ascending ?? true }),
};

function addCondition(conditions, rq) {
	conditions.forEach((condition) => {
		const handler = conditionHandlers[condition.where];
		if (handler) {
			rq = handler(rq, condition);
		} else {
			console.warn(`Unknown condition: ${condition.where}`);
		}
	});
	return rq;
}

async function executeQuery(queryPromise) {
	const { data, error } = await queryPromise;
	if (error) throw error;
	return data;
}

export async function fetchFromTable(
	table,
	select = "*",
	limit = DEFAULT_LIMIT,
	...conditions
) {
	if (!table) throw new Error("fetchFromTable: 'table' est requis.");
	let rq = supabase.from(table).select(select).limit(limit);

	rq = addCondition(conditions, rq);

	return await executeQuery(rq);
}

//table: string
export async function deleteFromTable(table, ...conditions) {
	let rq = supabase.from(table).delete();

	rq = addCondition(conditions, rq);

	await executeQuery(rq);
}

//table: string, valuesDict: Dictionary<key, value>
export async function addInTable(table, valuesDict, primaryKey = null) {
	const rq = supabase.from(table).upsert([valuesDict], {
		onConflict: primaryKey,
		ignoreDuplicates: false,
	});

	await executeQuery(rq);
}

export async function addLanguageInTable(language, name, modification_date) {
	const rq = supabase.from("language").upsert(
		[
			{
				language_id: language,
				name: name,
				modification_date: modification_date,
			},
		],
		{
			onConflict: "language_id",
			ignoreDuplicates: false,
		},
	);
	await executeQuery(rq);
}

export async function addLanguagesInTable(languages) {
	const valuesArray = languages.map(([language, name, modification_date]) => ({
		language_id: language,
		name: name,
		modification_date: modification_date,
	}));
	const rq = supabase.from("language").upsert(valuesArray, {
		onConflict: "language_id",
		ignoreDuplicates: false,
	});
	await executeQuery(rq);
}

export async function addFamilyInTable(family) {
	const rq = supabase.from("word_family").upsert([{ word_family_id: family }], {
		onConflict: "word_family_id",
		ignoreDuplicates: false,
	});
	await executeQuery(rq);
}

export async function addFamiliesInTable(families) {
	const valuesArray = families.map((family) => ({
		word_family_id: family,
	}));
	const rq = supabase.from("word_family").upsert(valuesArray, {
		onConflict: "word_family_id",
		ignoreDuplicates: false,
	});
	await executeQuery(rq);
}

export async function addWordInFamilyInTable(word, family) {
	const rq = supabase
		.from("word_family_association")
		.upsert([{ word_id: word, word_family_id: family }], {
			onConflict: "word_id, word_family_id",
			ignoreDuplicates: false,
		});
	await executeQuery(rq);
}

export async function addWordsInFamilyInTable(words, family) {
	const valuesArray = words.map((word) => ({
		word_id: word,
		word_family_id: family,
	}));
	const rq = supabase.from("word_family_association").upsert(valuesArray, {
		onConflict: "word_id, word_family_id",
		ignoreDuplicates: false,
	});
	await executeQuery(rq);
}

export async function addWordsInDataBase(words) {
	for (const wordData of words) {
		const word = wordData.word;
		const traductions = wordData.traductions;
		const date = wordData.date;
		await addInTable(
			"words",
			{ word_id: word, modification_date: date },
			"word_id",
		);
		for (const [language_id, value] of Object.entries(traductions)) {
			await addInTable(
				"word_translation",
				{
					word_id: word,
					language_id: language_id,
					value: value,
				},
				"word_id, language_id",
			);
		}
	}
}

export async function updateWordInTraduction(word, newTraductions) {
	// Supprimer les anciennes traductions
	await deleteFromTable("word_translation", {
		where: "eq",
		col: "word_id",
		value: word,
	});

	// Ajouter les nouvelles traductions
	for (const traduction of newTraductions) {
		await addInTable("word_translation", {
			word_id: word,
			language_id: traduction.language_id,
			value: traduction.value,
		});
	}
}

//table: string, updateValuesDict: Dictionary<key, value>
export async function updateInTable(table, updatedValuesDict, ...conditions) {
	let rq = supabase.from(table).update(updatedValuesDict);

	rq = addCondition(conditions, rq);

	await executeQuery(rq);
}
