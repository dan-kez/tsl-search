import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  LoaderFunctionArgs,
  redirect,
  RouterProvider,
} from 'react-router-dom';
import './index.css';
import Login from './Login.tsx';
import ManageDeck from './ManageDeck.tsx';
import { getExistingDeckInformationForForm } from "./getExistingDeckInformationForForm.tsx";
import AuthProvider from './AuthContext.tsx';
import { supabase } from './supabase/supabaseClient.ts';
import Search from './Search.tsx';
import DeckList from './DeckList.tsx';
import 'mana-font/css/mana.min.css';

async function isAuthenticated(): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
}

async function protectedLoader({ request }: LoaderFunctionArgs) {
  // If the user is not logged in and tries to access `/protected`, we redirect
  // them to `/login` with a `from` parameter that allows login to redirect back
  // to this page upon successful authentication
  const isAuthed = await isAuthenticated();
  if (isAuthed) return null;
  let params = new URLSearchParams();
  params.set('from', new URL(request.url).pathname);
  return redirect('/login');
}

const router = createBrowserRouter([
  {
    id: 'root',
    path: '/',
    children: [
      {
        index: true,
        Component: Search,
      },
      {
        path: 'login',
        loader: async () => {
          const isAuthed = await isAuthenticated();
          if (isAuthed) {
            const existingDeckInfo = await getExistingDeckInformationForForm();
            if (!existingDeckInfo.moxfield_url) {
              return redirect('/manage-deck');
            }
            return redirect('/search');
          }
          return null;
        },
        Component: Login,
      },
      {
        path: 'manage-deck',
        loader: protectedLoader,
        Component: ManageDeck,
      },
      {
        path: 'decks',
        Component: DeckList,
      },
      {
        path: 'logout',
        loader: async () => {
          const isAuthed = await isAuthenticated();
          if (isAuthed) {
            const { error } = await supabase.auth.signOut();
            if (error) console.error(error);
          }
          return redirect('/');
        },
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
