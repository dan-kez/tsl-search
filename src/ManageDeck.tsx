import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from './supabase/supabaseClient';
import { useEffect, useState } from 'react';
import NavBar from './NavBar';
import { getExistingDeckInformationForForm } from './getExistingDeckInformationForForm';
import PageShell from './PageShell';

export type ManageDeckInputs = {
  league_id: number;
  moxfield_url: string;
};

async function upsertDeckInformation(moxfield_id: string, league_id: number) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const upsertResult = await supabase
    .from('deck')
    .upsert(
      {
        league_id: league_id,
        user_id: user!?.id,
        moxfield_id: moxfield_id,
      },
      { onConflict: 'league_id, user_id' }
    )
    .select();

  // Ensure their deck is sync'd 
  await supabase.functions.invoke('moxfield-sync-one', { body: { deck_id: upsertResult.data![0].id } });
  // hack to sync all the other decks until I build a refresh button
  await supabase.functions.invoke('moxfield-sync', { body: { league_id } });
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
  const [leagues, setLeagues] = useState<{ id: string; name: string }[]>();

  useEffect(() => {
    const fetchLeagues = async () => {
      const { data } = await supabase.from('league').select();
      console.log(data);
      setLeagues(data as any);
    };
    fetchLeagues();
  }, []);

  const onSubmit: SubmitHandler<ManageDeckInputs> = async (data) => {
    let moxfield_id: string;
    try {
      const moxfield_url = new URL(data.moxfield_url);
      console.log(moxfield_url);
      if (moxfield_url.hostname !== 'www.moxfield.com') {
        setError('moxfield_url', { message: 'Hostname is not moxfield.com' });
        return;
      }
      const matches = moxfield_url.pathname.match(/\/decks\/([^\/]+)/);
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
      <h2>Manage Your Deck Details</h2>
      <form className="manage-deck" onSubmit={handleSubmit(onSubmit)}>
        {isSubmitSuccessful && (
          <span className="success">
            Submit Successful, Moxfield Data Refreshed
          </span>
        )}
        {isSubmitting && (
          <span className="success">Submitting and Importing Cards</span>
        )}
        {errors.root && <span className="error">{errors.root.message}</span>}
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
