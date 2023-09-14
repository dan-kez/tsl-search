import { useContext, useEffect, useState } from 'react';

import { AuthContext } from './AuthContext';
import { getExistingDeckInformationForForm } from './getExistingDeckInformationForForm';
import { NavLink } from 'react-router-dom';

function NavBar() {
  const { user } = useContext(AuthContext);
  const [hasDeckSetUp, setHasDeckSetUp] = useState<boolean | null>();
  useEffect(() => {
    if (user) {
      getExistingDeckInformationForForm().then(({ moxfield_url }) => {
        setHasDeckSetUp(!!moxfield_url);
      });
    }
  }, [user]);

  return (
    <>
      <div className="navbar">
        <div className='nav-links'>
          <NavLink to="/" className="navbar-item">
            TSL Search Tool
          </NavLink>
          <NavLink to="/decks" className="navbar-item">
            All Decks
          </NavLink>
          {user && (
            <NavLink to="/manage-deck" className="navbar-item">
              Manage Your Deck
            </NavLink>
          )}
          {!user && (
            <NavLink to="/login" className="navbar-item">
              Login
            </NavLink>
          )}
        </div>
        {hasDeckSetUp === false && (
          <NavLink to={user ? '/manage-deck' : '/login'}>
            <div className="add-deck-warning">
              {!user && 'Sign in to add your moxfield deck'}
              {user && 'Add your moxfield deck'}
            </div>
          </NavLink>
        )}
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
