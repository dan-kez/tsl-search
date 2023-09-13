import { useContext, useEffect, useState } from 'react';

import { AuthContext } from './AuthContext';
import { getExistingDeckInformationForForm } from './getExistingDeckInformationForForm';

function NavBar() {
  const { user } = useContext(AuthContext);
  const [hasDeckSetUp, setHasDeckSetUp] = useState<boolean | null>();
  useEffect(() => {
    getExistingDeckInformationForForm().then(({ moxfield_url }) => {
      setHasDeckSetUp(!!moxfield_url);
    });
  }, [user]);

  return (
    <>
      {hasDeckSetUp === false && (
        <div className="add-deck-warning">
          {!user && 'Log in to add your moxfield deck'}
          {user && 'Add your moxfield deck'}
        </div>
      )}
      <div className="navbar">
        <div>
          <a href="/" className="navbar-item">
            TSL Search Tool
          </a>
          <a href="/decks" className="navbar-item">
            All Decks
          </a>
          {user && (
            <a href="/manage-deck" className="navbar-item">
              Manage Your Deck
            </a>
          )}
          {!user && (
            <a href="/login" className="navbar-item">
              Login
            </a>
          )}
        </div>
        {user && user.user_metadata.picture && (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ marginRight: '10px' }}>
              {user.user_metadata.name}
            </span>
            <img
              src={user.user_metadata.picture}
              height="35px"
              style={{ borderRadius: '10px' }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default NavBar;
