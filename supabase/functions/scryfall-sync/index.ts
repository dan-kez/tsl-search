import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
};

interface RowToInsert {
  id: string;
  name: string;
  oracle_text: string;
  image_uri?: string;
  colors: string[];
  type_line: string;
  mana_cost: string;
  scryfall_id: string;
  rarity: string;
}

interface MoxfieldCardResponse {
  next_page?: string;
  has_more: boolean,
  data: {
    id: string;
    name: string;
    oracle_text: string;
    image_uris?: Record<string, string>;
    colors: string[];
    type_line: string;
    mana_cost: string;
    oracle_id?: string;
    rarity: string;
    card_faces?: { oracle_id: string }[];
  }[];
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const insertPageOfScryfallResults = async (
      nextPageUri: string | undefined
    ): Promise<any> => {
      if (!nextPageUri) return;
      const scryfallResponse = await fetch(nextPageUri);
      const scryfallResponseJson: MoxfieldCardResponse =
        await scryfallResponse.json();

      const oracleIdToRowsToInsert = scryfallResponseJson.data.reduce(
        (
          acc: Record<string, RowToInsert>,
          {
            id,
            name,
            oracle_text,
            image_uris,
            colors,
            type_line,
            mana_cost,
            oracle_id,
            rarity,
            card_faces,
          }: MoxfieldCardResponse['data'][0]
        ) => {
          const determinedOracleId = oracle_id
            ? oracle_id
            : card_faces?.[0]?.oracle_id;
          if (!determinedOracleId) return acc;

          acc[determinedOracleId] = {
            id: determinedOracleId,
            name,
            oracle_text,
            image_uri: image_uris?.normal,
            colors,
            type_line,
            mana_cost,
            scryfall_id: id,
            rarity,
          };
          return acc;
        },
        {}
      );

      const { error } = await supabaseClient
        .from('oracle_card')
        .upsert(Object.values(oracleIdToRowsToInsert), {
          onConflict: 'id',
        });
      if (error) throw error;
      if (scryfallResponseJson.has_more) {
        return insertPageOfScryfallResults(scryfallResponseJson.next_page);
      }
    };

    const { set_code } = await req.json();

    await insertPageOfScryfallResults(
      `https://api.scryfall.com/cards/search?order=set&q=s:${set_code} unique:prints`
    );

    return new Response(undefined, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
