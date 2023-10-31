import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { getThemeColors } from '../utils/themeUtils';
import { useUser } from '../context/UserContext';

function TopNavbar() {
  const { userData } = useUser();
  const navigate = useNavigate();
  const isLoggedIn = window.localStorage.getItem('loggedIn') === 'true';

  const handleLogout = () => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('loggedIn');
    navigate('/login');
  };

  const { mode, toggleMode } = React.useContext(ThemeContext)
  const { sameThemeColour, oppositeThemeColour } = getThemeColors(mode);

  return (
    <AppBar position="static" sx={{ backgroundColor: sameThemeColour }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Conditional rendering of the "Green-Workplace" link */}
            {isLoggedIn ? (
              <Typography
                variant="h6"
                noWrap
                component={Link}
                to="/homepage"
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  fontFamily: 'Arial',
                  fontWeight: 700,
                  color: '#1ED760',
                  textDecoration: 'none',
                }}
              >
                Green-Workplace
              </Typography>
            ) : (
              <Typography
                variant="h6"
                noWrap
                component={Link}
                to="/login"
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  fontFamily: 'Arial',
                  fontWeight: 700,
                  color: '#1ED760',
                  textDecoration: 'none',
                }}
              >
                Green-Workplace
              </Typography>
            )}
            <EnergySavingsLeafIcon sx={{ color: "#1ED760", display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ color: oppositeThemeColour }}>{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</h5>
            <IconButton sx={{ mr: 1, color: oppositeThemeColour }} onClick={() => toggleMode()}>
              {mode === 'dark' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
            {isLoggedIn ? (
              <>

                <Link to="/account" style={{ textDecoration: 'none' }}>
                  <IconButton sx={{ mr: 1 }}>
                    <Avatar alt={userData.firstname} src="/static/images/avatar/2.jpg" />
                  </IconButton>
                </Link>
                <Button onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : null}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default TopNavbar;
