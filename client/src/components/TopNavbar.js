import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import AdbIcon from '@mui/icons-material/Adb';
import { Link, useNavigate } from 'react-router-dom';

function TopNavbar() {
  const navigate = useNavigate();
  const isLoggedIn = window.localStorage.getItem('loggedIn') === 'true';

  const handleLogout = () => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('loggedIn');
    navigate('/login');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: 'black' }}>
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
                  color: '#5AB034',
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
                  color: '#5AB034',
                  textDecoration: 'none',
                }}
              >
                Green-Workplace
              </Typography>
            )}
            <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoggedIn ? (
              <>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
                <Link to="/account" style={{ textDecoration: 'none' }}>
                  <IconButton sx={{ p: 0 }}>
                    <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                  </IconButton>
                </Link>
              </>
            ) : null}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default TopNavbar;
