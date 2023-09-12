import './App.css';
import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from './supabase/supabaseClient';
import { useEffect, useState } from 'react';

type ManageDeckInputs = {
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
  await supabase.functions.invoke('moxfield-sync', { body: { league_id } });
  return upsertResult;
}

// running into issues with returning undefined in react-hook-form defaultValues
// @ts-expect-error
async function getExistingDeckInformationForForm(): Promise<ManageDeckInputs> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from('deck')
    .select()
    .filter('user_id', 'eq', user!?.id);
  if (data?.length === 1)
    return {
      league_id: data[0].league_id,
      moxfield_url: `https://www.moxfield.com/decks/${data[0].moxfield_id}`,
    };
}

function App() {
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
  console.log({isSubmitting, isSubmitSuccessful})

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
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form className="manage-deck" onSubmit={handleSubmit(onSubmit)}>
      {isSubmitSuccessful && <span className='success'>Submit Successful, Moxfield Data Refreshed</span>}
      {errors.root && <span className="error">{errors.root.message}</span>}
      {/* register your input into the hook by invoking the "register" function */}
      <label htmlFor="league_id">
        League:
        <select id="league_id" {...register('league_id')}>
          {leagues?.map(({ id, name }) => (
            <option value={id}>{name}</option>
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

      <button type="submit" disabled={isSubmitting}>Submit</button>
    </form>
  );
}

export default App;
