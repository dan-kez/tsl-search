// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from '@supabase/supabase-js';
import { serve } from 'std/server';
import { corsHeaders } from '../_shared/cores.ts';

const BASIC_LAND_NAMES = new Set([
  'Mountain',
  'Island',
  'Forest',
  'Swamp',
  'Plains',
]);

interface MoxfieldCardDetails {
  id: string;
  scryfall_id: string;
  name: string;
  cmc: string;
  color_identity: string[];
  type_line: string;
  mana_cost: string;
}

interface MoxfieldDeck {
  name: string;
  boards: {
    mainboard: {
      count: number;
      cards: Record<string, { quantity: number; card: MoxfieldCardDetails }>;
    };
    sideboard: {
      count: number;
      cards: Record<string, { quantity: number; card: MoxfieldCardDetails }>;
    };
    maybeboard: {
      count: number;
      cards: Record<string, { quantity: number; card: MoxfieldCardDetails }>;
    };
  };
}

const extractScryfallIdToQuanityFromMoxfieldDeck = (moxfieldDeck: MoxfieldDeck) => {
  const allBoardsJoined = {
    ...moxfieldDeck.boards.mainboard.cards,
    ...moxfieldDeck.boards.sideboard.cards,
    ...moxfieldDeck.boards.maybeboard.cards,
  };
  const allScryFallIdToQuanity = Object.values(allBoardsJoined)
    .filter(({ card }) => !BASIC_LAND_NAMES.has(card.name))
    .reduce<Record<string, number>>(
      (acc, { quantity, card: { scryfall_id } }) => {
        acc[scryfall_id] = quantity;
        return acc;
      },
      {}
    );

  return allScryFallIdToQuanity;
};

const getMoxfieldDeckList = async (
  moxfield_id: string
): Promise<MoxfieldDeck> => {
  const startTime = +new Date();
  const moxfieldResponse = await fetch(
    `https://api2.moxfield.com/v3/decks/all/${moxfield_id}`
  );
  const moxfieldDeck: MoxfieldDeck = await moxfieldResponse.json();
  console.log({ moxfieldDeckFetchDuration: +new Date() - startTime });
  return moxfieldDeck;
};

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

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
  const { deck_id } = await req.json();

  // Get sepecific decks in system for league
  const { data: decks } = await supabaseClient
    .from('deck')
    .select()
    .eq('id', deck_id);

  if (!decks) {
    return new Response(
      JSON.stringify({ message: `Could not find deck_id: ${deck_id}` }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      }
    );
  }
  const { moxfield_id, name: deckName } = decks[0];

  const moxfieldDeck = await getMoxfieldDeckList(moxfield_id);
  // Update the name if necessary
  if (deckName !== moxfieldDeck.name) {
    await supabaseClient
      .from('deck')
      .update({ name: moxfieldDeck.name })
      .eq('id', deck_id);
  }

  // Get the mapping of scryfall to oracle ids for the the set
  const allScryFallIdToQuanity = extractScryfallIdToQuanityFromMoxfieldDeck(moxfieldDeck);
  const { data: allOracleIdsAndScryFallIds } = await supabaseClient
    .from('oracle_card')
    .select('id, scryfall_id')
    .in('scryfall_id', Object.keys(allScryFallIdToQuanity));

  if (!allOracleIdsAndScryFallIds) {
    return new Response(
      JSON.stringify({
        message: 'Could not find associated scryfall entries',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }

  const scryfallIdToOracleIdMap = allOracleIdsAndScryFallIds.reduce<
    Record<string, string>
  >((acc, { id: oracle_id, scryfall_id }) => {
    acc[scryfall_id] = oracle_id;
    return acc;
  }, {});

  const distinctOracleIdsToQuantity = Object.keys(allScryFallIdToQuanity).reduce<Record<string, number>>((acc, scryfallId) => {
    const oracleId = scryfallIdToOracleIdMap[scryfallId];
    if (!oracleId) return acc;
    acc[oracleId] = allScryFallIdToQuanity[scryfallId]
    return acc;
  }, {})

  const distinctOracleIdsToAdd = Object.keys(distinctOracleIdsToQuantity);

  // Delete cards not in their pool
  await supabaseClient
    .from('card_pool_oracle')
    .delete()
    .eq('deck_id', deck_id)
    .not('oracle_id', 'in', `(${distinctOracleIdsToAdd.join(',')})`);

  // Determine which oracle cards are in our system (oracle_card may be out of date)
  const { data: validOracleIdsMap } = await supabaseClient
    .from('oracle_card')
    .select('id')
    .in('id', distinctOracleIdsToAdd);

  const validOracleIds: string[] = validOracleIdsMap!.map(
    ({ id: oracleId }) => oracleId
  );

  // Warn if there are missing cards
  if (validOracleIds.length != distinctOracleIdsToAdd.length) {
    const invalidCardsInMoxfield = distinctOracleIdsToAdd.filter(
      (x) => !validOracleIds.includes(x)
    );
    console.warn({
      error: 'Missing oracle cards',
      deck_id,
      invalidCardsInMoxfield,
    });
  }

  // Add all cards not in their pool
  try {
    await supabaseClient
      .from('card_pool_oracle')
      .upsert(
        Object.entries(distinctOracleIdsToQuantity).map(([oracle_id, quantity]) => ({
          oracle_id,
          deck_id,
          quantity,
        })),
        { onConflict: 'oracle_id, deck_id' }
      )
      .select();
  } catch (e) {
    console.error(e);
  }

  return new Response(null, {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
