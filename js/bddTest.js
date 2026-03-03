//import { createClient } from '@supabase/supabase-js'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Create a single supabase client for interacting with your database
const supabaseUrl = 'https://kywafnfxmugjwhykwiae.supabase.co';
const supabaseKey = 'sb_publishable_TP4XKscxru5L9s1_NdZLag_9X-q-z3E';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchWords() {
    const { data, error } = await supabase
        .from('words')
        .select('key');
    if (error) {
        console.error("Error while fetching words:", error);
        return [];
    }
    return data.map(row => row.key);
}

export async function addWordToDB(wordKey) {
    const { error } = await supabase
        .from('words')
        .insert([{ key: wordKey }])
        .select();

    if (error) {
        console.error("Error while adding word:", error);
        return false;
    }
    return true;
}

export async function deleteWordFromDB(wordKey) {
    const { error } = await supabase
        .from('words')
        .delete()
        .match({ key: wordKey });

    if (error) {
        console.error("Error while deleting word:", error);
        return false;
    }
    return true;
}

export async function testFunc() {
    console.log("test")
}