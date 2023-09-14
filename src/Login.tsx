import { useState } from 'react';
import { supabase } from './supabase/supabaseClient';
import NavBar from './NavBar';
import PageShell from './PageShell';

console.log(import.meta.env.VITE_PUBLIC_SITE_URL)
console.log(import.meta.env.VITE_NEXT_PUBLIC_VERCEL_URL)

const getURL = () => {
  let url =
    import.meta.env.VITE_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    import.meta.env.VITE_NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:5173/';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  return url;
};

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: any) => {
    event.preventDefault();

    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: getURL(),
      },
    });

    if (error) {
      alert(error.name || error.message);
    }
    setLoading(false);
  };

  return (
    <PageShell paddedBody>
      <div className="padded-body row flex flex-center">
        <div className="col-6 form-widget">
          <h1 className="header">Tavern Sealed League Manager</h1>
          <p>
            Sign in to add sync your moxfield deck to be available through search.
          </p>
          <form className="form-widget" onSubmit={handleLogin}>
            <button className={'button block discord-login'} disabled={loading}>
              {loading ? (
                <span>Loading</span>
              ) : (
                <span>Sign In With Discord</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
