// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from '@supabase/supabase-js';
import { serve } from 'std/server';
import { corsHeaders } from '../_shared/cores.ts';

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
    .select('id')
    .eq('league_id', league_id);

  const allPromises = decks!.map(async ({ id: deck_id }) => {
    await supabaseClient.functions.invoke('moxfield-sync-one', { body: { deck_id } });
    await supabaseClient.functions.invoke('moxfield-sync-one-oracle', { body: { deck_id } });
  });

  await Promise.all(allPromises);

  return new Response(undefined, {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
