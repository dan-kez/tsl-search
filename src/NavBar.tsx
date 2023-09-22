import { MouseEventHandler, useContext, useEffect, useState } from 'react';

import { AuthContext } from './AuthContext';
import { getExistingDeckInformationForForm } from './getExistingDeckInformationForForm';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Folder as FolderIcon,
  Star as StarIcon,
  Handshake as HandshakeIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';

function NavBar() {
  const { user } = useContext(AuthContext);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [hasDeckSetUp, setHasDeckSetUp] = useState<boolean | null>();

  const { pathname } = useLocation();

  useEffect(() => {
    setDrawerIsOpen(false); // Close the navigation panel
  }, [pathname]);

  const toggleDrawer =
    (open: boolean): MouseEventHandler<HTMLButtonElement> =>
    (event) => {
      if (
        event.type === 'keydown' &&
        // @ts-expect-error -- key does exist unclear on the error
        (event.key === 'Tab' || event.key === 'Shift')
      ) {
        return;
      }
      //changes the function state according to the value of open
      setDrawerIsOpen(open);
    };
  useEffect(() => {
    if (user) {
      getExistingDeckInformationForForm().then(({ moxfield_url }) => {
        setHasDeckSetUp(!!moxfield_url);
      });
    }
  }, [user]);

  return (
    <>
      {hasDeckSetUp === false && (
        <NavLink to={user ? '/manage-deck' : '/login'}>
          <div className="add-deck-warning">
            {!user && 'Sign in to add your moxfield deck'}
            {user && 'Add your moxfield deck'}
            <LaunchIcon />
          </div>
        </NavLink>
      )}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            TSL Search
          </Typography>

          {!user && (
            <Button
              component={Link}
              to="/login"
              variant="contained"
              color="info"
            >
              Login
            </Button>
          )}
          <Drawer
            anchor="left"
            variant="temporary"
            open={drawerIsOpen}
            onClose={toggleDrawer(false)}
          >
            <Box
              sx={{
                p: 2,
                height: 1,
                width: '200px',
              }}
            >
              <Box
                sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}
              >
                <IconButton onClick={toggleDrawer(false)}>
                  <CloseIcon />
                </IconButton>
                {user && user.user_metadata.picture && (
                  <Box
                    sx={{
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
                  </Box>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <ListItemButton component={Link} to="/">
                  <ListItemIcon>
                    <SearchIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="Search" />
                </ListItemButton>
                <ListItemButton component={Link} to="/decks">
                  <ListItemIcon>
                    <FolderIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary="All Decks" />
                </ListItemButton>
                {user && (
                  <>
                    <ListItemButton component={Link} to="/manage-deck">
                      <ListItemIcon>
                        <FolderIcon sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText primary="Manage Deck" />
                    </ListItemButton>
                    <ListItemButton component={Link} to="/manage-deck">
                      <ListItemIcon>
                        <StarIcon sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText primary="Wishlist" />
                    </ListItemButton>
                    <ListItemButton component={Link} to="/manage-deck">
                      <ListItemIcon>
                        <HandshakeIcon sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText primary="Recommended Trades" />
                    </ListItemButton>
                  </>
                )}
              </Box>
            </Box>
          </Drawer>
        </Toolbar>
      </AppBar>
    </>
  );
}

export default NavBar;
