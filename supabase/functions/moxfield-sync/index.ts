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
      cards: Record<string, { card: MoxfieldCardDetails }>;
    };
    sideboard: {
      count: number;
      cards: Record<string, { card: MoxfieldCardDetails }>;
    };
    maybeboard: {
      count: number;
      cards: Record<string, { card: MoxfieldCardDetails }>;
    };
  };
}

const extractScryFallIdFromMoxfieldDeck = (moxfieldDeck: MoxfieldDeck) => {
  const allBoardsJoined = {
    ...moxfieldDeck.boards.mainboard.cards,
    ...moxfieldDeck.boards.sideboard.cards,
    ...moxfieldDeck.boards.maybeboard.cards,
  };
  const allScryFallIds = Object.values(allBoardsJoined)
    .filter(({ card }) => !BASIC_LAND_NAMES.has(card.name))
    .map(({ card: { scryfall_id } }) => scryfall_id);

  return allScryFallIds;
};

const getMoxfieldDeckList = async (
  moxfield_id: string
): Promise<MoxfieldDeck> => {
  const moxfieldResponse = await fetch(
    `https://api2.moxfield.com/v3/decks/all/${moxfield_id}`
  );
  const moxfieldDeck: MoxfieldDeck = await moxfieldResponse.json();
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
  const { league_id } = await req.json();

  // Get all decks in system for league
  const { data: decks } = await supabaseClient
    .from('deck')
    .select()
    .eq('league_id', league_id);

  const allPromises = decks!.map(
    async ({ id: deck_id, moxfield_id, name: deckName }) => {
      const moxfieldDeck = await getMoxfieldDeckList(moxfield_id);
      // Update the name if necessary
      if (deckName !== moxfieldDeck.name) {
        await supabaseClient
          .from('deck')
          .update({ name: moxfieldDeck.name })
          .eq('id', deck_id);
      }
      const allScryFallIds = extractScryFallIdFromMoxfieldDeck(moxfieldDeck);

      // Delete cards not in their pool
      await supabaseClient
        .from('card_pool')
        .delete()
        .eq('deck_id', deck_id)
        .not('scryfall_id', 'in', allScryFallIds);

      // Determine which scryfall cards are in our system (scryfall_card may be out of date)
      const { data: validScryfallIdsMap } = await supabaseClient
        .from('scryfall_card')
        .select('id')
        .in('id', allScryFallIds);

      const validScryfallIds: string[] = validScryfallIdsMap!.map(
        ({ id: scryfallId }) => scryfallId
      );

      // Warn if there are missing cards
      if (validScryfallIds.length != allScryFallIds.length) {
        const invalidCardsInMoxfield = allScryFallIds.filter(
          (x) => !validScryfallIds.includes(x)
        );
        console.warn({
          error: 'Missing scryfall cards',
          deck_id,
          invalidCardsInMoxfield,
        });
      }

      // Add all cards not in their pool
      try {
        const insertResponse = await supabaseClient
          .from('card_pool')
          .upsert(
            validScryfallIds.map((scryfall_id) => ({
              scryfall_id,
              deck_id,
            })),
            { ignoreDuplicates: true }
          )
          .select();
        console.log(insertResponse);
      } catch (e) {
        console.error(e);
      }
    }
  );
  await Promise.all(allPromises);

  return new Response(undefined, {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
