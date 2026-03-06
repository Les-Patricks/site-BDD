//import { createClient } from '@supabase/supabase-js'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = "https://kywafnfxmugjwhykwiae.supabase.co";
const supabaseKey = "sb_publishable_TP4XKscxru5L9s1_NdZLag_9X-q-z3E";
const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_LIMIT = 1000;

// ─── Generalist functions ──────────────────────────────────

const conditionHandlers = {
    eq:     (rq, c) => rq.eq(c.col, c.value),
    neq:    (rq, c) => rq.neq(c.col, c.value),
    gt:     (rq, c) => rq.gt(c.col, c.value),
    gte:    (rq, c) => rq.gte(c.col, c.value),
    lt:     (rq, c) => rq.lt(c.col, c.value),
    lte:    (rq, c) => rq.lte(c.col, c.value),
    like:   (rq, c) => rq.like(c.col, c.value),
    ilike:  (rq, c) => rq.ilike(c.col, c.value),
    is:     (rq, c) => rq.is(c.col, c.value),
    in:     (rq, c) => rq.in(c.col, c.value),
    match:  (rq, c) => rq.match(c.value),
    or:     (rq, c) => rq.or(c.value),
    order:  (rq, c) => rq.order(c.col, { ascending: c.ascending ?? true }),
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
    const {data, error} = await queryPromise;
    if (error) throw error;
    return data;
}

export async function fetchFromTable(table, select = '*', limit = DEFAULT_LIMIT, ...conditions) {
    if (!table) throw new Error("fetchFromTable: 'table' est requis.");
    let rq = supabase
       .from(table)
       .select(select)
       .limit(limit);
    
    rq = addCondition(conditions, rq);

   return await executeQuery(rq);
}

//table: string
export async function deleteFromTable(table, ...conditions) {
    
    let rq = supabase
        .from(table)
        .delete();
    
    rq = addCondition(conditions, rq);

    await executeQuery(rq)
}

//table: string, valuesDict: Dictionary<key, value>
export async function addInTable(table, valuesDict){
    const rq = supabase
        .from(table)
        .insert([valuesDict]);

    await executeQuery(rq)
}

//table: string, updateValuesDict: Dictionary<key, value>
export async function updateInTable(table, updatedValuesDict, ...conditions){

    let rq = supabase
        .from(table)
        .update(updatedValuesDict)

    rq = addCondition(conditions, rq);

    await executeQuery(rq)
}

// ─────────────────────────────────────────────────────────────n

// exemple func
export async function testFunc() {
    console.log("test")
    console.log(...await fetchFromTable("words", "*"));
    
    // word add -> update -> delete
    await addInTable("words", {word_id: "Test"})
    console.log(...await fetchFromTable("words", "*", 10));
    await updateInTable("words", {word_id: `Test${Math.floor(Math.random() * 100)}`}, {where: "eq", col: "word_id", value: "Test"});
    console.log(...await fetchFromTable("words", "*"));
    await updateInTable("words", {word_id: "Test"}, {where: "ilike", col: "word_id", value: "Test%"});
    console.log("test match")
    console.log(...await fetchFromTable("words", "*", 10, {where: "match", value: {word_id: "Test"}}));
    await deleteFromTable("words", {where: "eq", col: "word_id", value: "Test"});
    console.log(...await fetchFromTable("words", "*"));
    
    // family association add -> delete
    await addInTable("word_family_association", {word_id: "chat", word_family_id: 0})
    console.log(...await fetchFromTable("word_family_association", "*"));
    await deleteFromTable("word_family_association",
        {where: "eq", col: "word_id", value: "chat"},
        {where: "eq", col: "word_family_id", value: 0}
    );
    console.log(...await fetchFromTable("word_family_association", "*"));
    
    // word translation add -> delete
    await addInTable("word_translation", {word_id: "chat", language_id: "fr", value: "chat"})
    await addInTable("word_translation", {word_id: "chat", language_id: "en", value: "cat"})
    console.log(...await fetchFromTable("word_translation", "*"));
    await deleteFromTable("word_translation",
        {where: "eq", col: "word_id", value: "chat"},
        {where: "eq", col: "language_id", value: "en"}
    );
    await deleteFromTable("word_translation",
        {where: "eq", col: "word_id", value: "chat"},
        {where: "eq", col: "language_id", value: "fr"}
    );
    console.log(...await fetchFromTable("word_translation", "*"));
    
    // language add -> delete
    console.log(...await fetchFromTable("language", "*"));
    await addInTable("language", {language_id: "te", name: "test"})
    console.log(...await fetchFromTable("language", "*"));
    await deleteFromTable("language", {where: "eq", col: "language_id", value: "te"});
    console.log(...await fetchFromTable("language", "*"));
}