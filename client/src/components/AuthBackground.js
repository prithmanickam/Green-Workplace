import React from 'react';
import { Grid, Paper } from '@mui/material';

const AuthBackground = ({ backgroundImageUrl }) => (
  <Grid
    component={Paper}
    elevation={10}
    item
    xs={12}
    sm={4}
    md={8}
    sx={{
      backgroundImage: `url(${backgroundImageUrl})`,
      backgroundRepeat: 'no-repeat',
      backgroundColor: (t) =>
        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  />
);

export default AuthBackground;
