import { useContext } from 'react';

import { AuthContext } from './AuthContext';

function NavBar() {
  const { user } = useContext(AuthContext);
  return (
    <div className="navbar">
      <div>
        <a href="/search" className="navbar-item">
          TSL Search Tool
        </a>
        {user && (
          <a href="/decks" className="navbar-item">
            All Decks
          </a>
        )}
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
          <span style={{ marginRight: '10px' }}>{user.user_metadata.name}</span>
          <img
            src={user.user_metadata.picture}
            height="35px"
            style={{ borderRadius: '10px' }}
          />
        </div>
      )}
    </div>
  );
}

export default NavBar;
