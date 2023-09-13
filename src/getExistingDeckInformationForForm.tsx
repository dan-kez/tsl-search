import { supabase } from './supabase/supabaseClient';
import { ManageDeckInputs } from './ManageDeck';


export async function getExistingDeckInformationForForm(): Promise<ManageDeckInputs> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('deck')
    .select()
    .filter('user_id', 'eq', user?.id)
    .limit(1);
  if (data?.length === 1)
    return {
      league_id: data[0].league_id,
      moxfield_url: `https://www.moxfield.com/decks/${data[0].moxfield_id}`,
    };

  return {
    league_id: 1,
    moxfield_url: '',
  };
}
