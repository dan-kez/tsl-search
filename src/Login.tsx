import { useState } from 'react';
import { supabase } from './supabase/supabaseClient';
import NavBar from './NavBar';

export default function Auth() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: any) => {
    event.preventDefault();

    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
    });

    if (error) {
      alert(error.name || error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <NavBar />
      <div className="row flex flex-center">
        <div className="col-6 form-widget">
          <h1 className="header">Tavern Sealed League Manager</h1>
          <p className="description">Sign in via discord</p>
          <form className="form-widget" onSubmit={handleLogin}>
            <button className={'button block'} disabled={loading}>
              {loading ? (
                <span>Loading</span>
              ) : (
                <span>Sign In With Discord</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
