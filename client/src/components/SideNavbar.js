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
import { useUser } from '../context/UserContext';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import ChatIcon from '@mui/icons-material/Chat';
import AppsIcon from '@mui/icons-material/Apps';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import EventIcon from '@mui/icons-material/Event';

const drawerWidth = 240;

const adminMenuItems = [
  { text: 'Company Dashboard', route: '/CompanyDashboard', icon: <BusinessIcon /> },
  { text: 'Add Employees', route: '/AddEmployees', icon: <PersonAddIcon /> },
  { text: 'Add Teams', route: '/AddTeams', icon: <GroupAddIcon /> },
  { text: 'Admin Functions', route: '/CompanyAdminFunctions', icon: <SettingsIcon /> },
];

const employeeMenuItems = [
  { text: 'Set Carbon Footprint', route: '/SetCarbonFootprint', icon: <EnergySavingsLeafIcon /> },
  { text: 'Your Dashboard', route: '/YourDashboard', icon: <DashboardIcon /> },
  { text: 'Team Chat', route: '/TeamChat', icon: <ChatIcon /> },
  { text: 'Team Dashboard', route: '/TeamDashboard', icon: <AppsIcon /> },
  { text: 'Team Owner Functions', route: '/Team Owner Functions', icon: <SettingsIcon /> },
  { text: 'Join or Leave a Team', route: '/Join or Leave a Team', icon: <GroupIcon /> },
  { text: 'Company Dashboard', route: '/CompanyDashboard', icon: <BusinessIcon /> },
  { text: 'Book Floors', route: '/Book Floors', icon: <EventSeatIcon /> },
  { text: 'View Events', route: '/ViewEvents', icon: <EventIcon /> },
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
  const { userData } = useUser();

  //display the right cards for the type of user logged in
  let menuItems = employeeMenuItems;

  if (userData && userData.type === 'Admin') {
    menuItems = adminMenuItems;
  }

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
              <Typography variant="h6" noWrap sx={{ color: '#1ED760', fontFamily: 'Arial', fontWeight: 700 }}>
                Green-Workplace
              </Typography>
            </Link>
            <EnergySavingsLeafIcon sx={{ color: "#1ED760", display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h5 style={{ color: oppositeThemeColour }}>{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</h5>
            <IconButton sx={{ mr: 1, color: oppositeThemeColour }} onClick={() => toggleMode()}>
              {mode === 'dark' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>

            <Link to="/account" style={{ textDecoration: 'none' }}>
              <IconButton sx={{ mr: 1 }}>
                {userData ? (
                  <Avatar alt={userData.firstname} src="/static/images/avatar/2.jpg" />
                ) : (
                  <Avatar src="/static/images/avatar/2.jpg" />
                )}
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