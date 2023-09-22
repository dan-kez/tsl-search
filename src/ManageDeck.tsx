import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from './supabase/supabaseClient';
import { useEffect, useState } from 'react';
import { getExistingDeckInformationForForm } from './getExistingDeckInformationForForm';
import PageShell from './PageShell';
import { Typography } from '@mui/material';

export type ManageDeckInputs = {
  league_id: number;
  moxfield_url: string;
};

async function upsertDeckInformation(moxfield_id: string, league_id: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    throw new Error('User is not logged in');
  }
  const upsertResult = await supabase
    .from('deck')
    .upsert(
      {
        league_id: league_id,
        user_id: user!.id,
        moxfield_id: moxfield_id,
      },
      { onConflict: 'league_id, user_id' }
    )
    .select();

  // Ensure their deck is sync'd
  await supabase.functions.invoke('moxfield-sync-one-oracle', {
    body: { deck_id: upsertResult.data![0].id },
  });
  // Hack to sync all the other decks until I build a refresh button
  supabase.functions.invoke('moxfield-sync', { body: { league_id } });
  return upsertResult;
}

function ManageDeck() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ManageDeckInputs>({
    defaultValues: () => getExistingDeckInformationForForm(),
  });
  const [leagues, setLeagues] = useState<{ id: number; name: string }[]>();

  useEffect(() => {
    const fetchLeagues = async () => {
      const { data } = await supabase.from('league').select();
      if (data) {
        setLeagues(data);
      } else {
        console.error('No Leagues found.');
      }
    };
    fetchLeagues();
  }, []);

  const onSubmit: SubmitHandler<ManageDeckInputs> = async (data) => {
    let moxfield_id: string;
    try {
      const moxfield_url = new URL(data.moxfield_url);

      if (moxfield_url.hostname !== 'www.moxfield.com') {
        setError('moxfield_url', { message: 'Hostname is not moxfield.com' });
        return;
      }
      const matches = moxfield_url.pathname.match(/\/decks\/([^/]+)/);
      if (!matches) {
        setError('moxfield_url', {
          message: 'Path does not match a valid moxfield url',
        });
        return;
      }
      moxfield_id = matches[1];
      const res = await upsertDeckInformation(moxfield_id, data.league_id);
      if (res.error) {
        setError('root', { message: res.error?.message });
      }
    } catch (e) {
      console.error(e);
      setError('moxfield_url', { message: 'Insert a valid moxfield url' });
    }
  };

  return (
    <PageShell paddedBody>
      <Typography variant="h4">Manage Your Deck Details</Typography>
      <form className="manage-deck" onSubmit={handleSubmit(onSubmit)}>
        {isSubmitSuccessful && (
          <Typography variant="h4" color="success.main">
            Submit Successful, Moxfield Data Refreshed
          </Typography>
        )}
        {isSubmitting && (
          <Typography variant="h5" color="info.main">
            Submitting and Importing Cards
          </Typography>
        )}
        {errors.root && (
          <Typography variant="h4" color="error.main">
            {errors.root.message}
          </Typography>
        )}
        {/* register your input into the hook by invoking the "register" function */}
        <label htmlFor="league_id">
          League:
          <select id="league_id" {...register('league_id')}>
            {leagues?.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="moxfield_url">
          Moxfield Url:
          <input id="moxfield_url" type="url" {...register('moxfield_url')} />
        </label>
        {/* errors will return when field validation fails  */}
        {errors.moxfield_url && (
          <span className="error">{errors.moxfield_url.message}</span>
        )}

        <button type="submit" disabled={isSubmitting}>
          Submit
        </button>
      </form>
    </PageShell>
  );
}

export default ManageDeck;
