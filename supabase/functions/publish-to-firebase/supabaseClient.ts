import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://kywafnfxmugjwhykwiae.supabase.co";
const supabaseKey = Deno.env.get("SERVICE_KEY")!;
export const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_LIMIT = 1000;

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

async function executeQuery(queryPromise) {
	const { data, error } = await queryPromise;
	if (error) throw error;
	return data;
}
