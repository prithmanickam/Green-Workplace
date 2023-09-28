import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import AdbIcon from '@mui/icons-material/Adb';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeColors } from '../utils/themeUtils'; 

const drawerWidth = 240;

const menuItems = [
  { text: 'Company Dashboard', route: '/CompanyDashboard', icon: <DashboardIcon /> },
  { text: 'Add Employees', route: '/AddEmployees', icon: <PersonAddIcon /> },
  { text: 'Add Teams', route: '/AddTeams', icon: <GroupAddIcon /> },
  { text: 'Admin Functions', route: '/CompanyAdminFunctions', icon: <SettingsIcon /> },
];

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function SideNavbar() {
  const [open, setOpen] = React.useState(true);
  const [selectedRoute, setSelectedRoute] = React.useState('/homepage');
  const navigate = useNavigate();
  const { mode, toggleMode } = React.useContext(ThemeContext)
  const { sameThemeColour, oppositeThemeColour } = getThemeColors(mode);
  const sideNavbarMenuColour = mode === 'light' ? '#ECECEC' : '#2C2C2C';
  const sideNavbarMenuOptionColour = mode === 'light' ? 'lightgrey' : '#444';


  const handleMenuItemClick = (route) => {
    setSelectedRoute(route);
    navigate(route);
  };

  React.useEffect(() => {
    setSelectedRoute(window.location.pathname);
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('loggedIn');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <MuiAppBar
        position="fixed"
        sx={{
          backgroundColor: sameThemeColour,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: `calc(100% - ${0}px)`,
          marginLeft: open ? drawerWidth : 0,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              //color="inherit"
              aria-label="open drawer"
              onClick={() => setOpen(!open)}
              edge="start"
              sx={{
                marginRight: '36px',
                colour: oppositeThemeColour
              }}
            >
              <MenuIcon />
            </IconButton>
            <Link to="/homepage" style={{ textDecoration: 'none' }}>
              <Typography variant="h6" noWrap sx={{ color: '#5AB034', fontFamily: 'Arial', fontWeight: 700 }}>
                Green-Workplace
              </Typography>
            </Link>
            <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: "green" }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ color: oppositeThemeColour }}>{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</h5>
            <IconButton sx={{ mr: 1, color: oppositeThemeColour }} onClick={() => toggleMode()}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            <Link to="/account" style={{ textDecoration: 'none' }}>
              <IconButton sx={{ mr: 1 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Link>
            <Button onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </MuiAppBar>
      <Drawer variant="permanent" open={open} sx={{ '& .MuiDrawer-paper': { backgroundColor: sideNavbarMenuColour } }}>
        <Box height={65} />
        <Divider />
        <List>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              disablePadding
              sx={{ display: 'block' }}
              onClick={() => handleMenuItemClick(item.route)}
              selected={selectedRoute === item.route}
              button
            >
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  backgroundColor: selectedRoute === item.route ? sideNavbarMenuOptionColour : 'transparent',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: oppositeThemeColour,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, color: oppositeThemeColour }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}