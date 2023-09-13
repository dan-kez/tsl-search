import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { createContext, useEffect, useState } from 'react';
import { supabase } from './supabase/supabaseClient';

const initialState: { session: Session | null; user: User | null } = {
  session: null,
  user: null,
};

export const AuthContext = createContext(initialState);

export function useAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(callback);
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */
}

const AuthProvider: React.FunctionComponent<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ session, user: session?.user ?? null });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, user: session?.user ?? null });
    });
  }, []);

  useAuthStateChange((event, session) => {
    console.log(`Supabase auth event: ${event}`, session);
    setState({ session, user: session?.user ?? null });
  });

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
