import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from 'react-router-dom';
import { getExistingDeckInformationForForm } from './getExistingDeckInformationForForm.tsx';
import { supabase } from './supabase/supabaseClient.ts';

import 'mana-font/css/mana.min.css';
import { lazy } from 'react';

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

async function protectedLoader() {
  const isAuthed = await isAuthenticated();
  if (isAuthed) return null;

  return redirect('/login');
}

const router = createBrowserRouter([
  {
    id: 'root',
    path: '/',
    children: [
      {
        index: true,
        Component: lazy(() => import('./Search')),
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
        Component: lazy(() => import('./Login')),
      },
      {
        path: 'manage-deck',
        loader: protectedLoader,
        Component: lazy(() => import('./ManageDeck')),
      },
      {
        path: 'decks',
        Component: lazy(() => import('./DeckList.tsx')),
      },
      {
        path: 'wishlist',
        loader: protectedLoader,
        Component: lazy(() => import('./WishList')),
      },
      {
        path: 'potential-trades',
        loader: protectedLoader,
        Component: lazy(() => import('./PotentialTrades')),
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

const CustomBrowserRouter = () => <RouterProvider router={router}/>;

export default CustomBrowserRouter;
