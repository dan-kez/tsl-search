import './App.css';
import { useContext } from 'react';

import { AuthContext } from './AuthContext';

function NavBar() {
  const { user } = useContext(AuthContext);
  return (
    <div className="navbar">
      <a href="/" className="navbar-item">
        TSL Search Tool
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
  );
}

export default NavBar;
