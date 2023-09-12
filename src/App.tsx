import './App.css';
import { useState, useEffect } from 'react';
import { supabase } from './supabase/supabaseClient';
import Auth from './Auth';
import ManageDeck from './ManageDeck';
import { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
      }
    });
  }, []);

  return (
    <>
      <div className="navbar">
        <div role="button" className="logo">
          TSL Search Tool
        </div>
        <div role="button" className="manage-deck-nav">Manage Deck</div>
      </div>
      <div className='body'>{!session ? <Auth /> : <ManageDeck />}</div>
    </>
  );
}

export default App;
