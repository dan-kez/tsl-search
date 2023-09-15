import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
};

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
      const scryfallResponseJson = await scryfallResponse.json();

      const { error } = await supabaseClient.from('oracle_card').upsert(
        scryfallResponseJson.data
          .map(
            ({
              id,
              name,
              oracle_text,
              image_uris,
              colors,
              type_line,
              mana_cost,
              oracle_id,
              card_faces,
            }: any) => {
              const determinedOracleId = oracle_id
                ? oracle_id
                : card_faces?.[0]?.oracle_id;
              if (!determinedOracleId) return undefined;
              return {
                id: determinedOracleId,
                scryfall_id: id,
                name,
                oracle_text,
                image_uri: image_uris?.normal,
                colors,
                type_line,
                mana_cost,
              };
            }
          )
          // Remove any vards missing oracle_id
          .filter((value: any) => !!value)
      );
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
