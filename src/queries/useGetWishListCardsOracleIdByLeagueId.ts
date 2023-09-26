import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { supabase } from '../supabase/supabaseClient';

interface SumWishlistOverlapResponse {
  wishlist_id: number;
  end_wishlist_id: number;
  deck_id_with_wishlisted_card: number;
  moxfield_id: string;
  discord_name: string;
  sum_overlap: number;
  wishlist1: {
    id: number;
    user_id: string;
    league_id: number;
  };
}

const getWishListCardsOracleIdByLeagueId = async ({
  league_id,
  user_id,
}: {
  league_id: number;
  user_id: string;
}): Promise<SumWishlistOverlapResponse[]> => {
  const query = supabase
    .from('sum_wishlist_overlap')
    .select(
      `
        wishlist1:wishlist!wishlist_id!inner (id, user_id, league_id),
        *
        `
    )
    .eq('wishlist1.league_id', league_id)
    .eq('wishlist1.user_id', user_id);

  const { data: cardResponses, error } = await query;
  if (error) {
    console.error(error);
  }
  return cardResponses || [];
};

const useGetWishListCardsOracleIdByLeagueId = (
  league_id: number
): SumWishlistOverlapResponse[] => {
  const { user } = useContext(AuthContext);
  const [response, setResponse] = useState<SumWishlistOverlapResponse[]>([]);

  useEffect(() => {
    if (user && user.id) {
      getWishListCardsOracleIdByLeagueId({
        user_id: user.id,
        league_id: league_id,
      }).then((cardResponses) => {
        setResponse(cardResponses);
      });
    }
  }, [user?.id, league_id]);

  return response;
};

export default useGetWishListCardsOracleIdByLeagueId;
