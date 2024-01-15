import React from 'react';
import { Typography, Stack, Divider } from '@mui/material';
import PropTypes from 'prop-types';


export default function CarbonStandardPopover({ companyCarbonStandard, greenGradient, amberGradient, redGradient }) {
  CarbonStandardPopover.propTypes = {
    companyCarbonStandard: PropTypes.shape({
      amber_carbon_standard: PropTypes.number.isRequired,
      red_carbon_standard: PropTypes.number.isRequired
    }).isRequired,
    greenGradient: PropTypes.string.isRequired,
    amberGradient: PropTypes.string.isRequired,
    redGradient: PropTypes.string.isRequired
  };
  
  return (
    <>
      <Typography style={{ padding: '8px' }}>
        Carbon Footprint Standard
      </Typography>
      <Divider />
      <Stack direction="row" spacing={2} py={0.5} alignItems="center">
        <Typography style={{ flex: 1, textAlign: 'left', paddingLeft: '10px' }}>
          Good: &lt; {companyCarbonStandard.amber_carbon_standard} kg
        </Typography>
        <div
          className="green-gradient"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            alignSelf: 'center',
            marginRight: '10px',
            backgroundImage: greenGradient
          }}
        ></div>
      </Stack>
      <Stack direction="row" spacing={2} py={0.5} alignItems="center">
        <Typography style={{ flex: 1, textAlign: 'left', paddingLeft: '10px' }}>
          Average: {companyCarbonStandard.amber_carbon_standard} &lt;= & &lt; {companyCarbonStandard.red_carbon_standard} kg
        </Typography>
        <div
          className="amber-gradient"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            alignSelf: 'center',
            marginRight: '10px',
            backgroundImage: amberGradient
          }}
        ></div>
      </Stack>
      <Stack direction="row" spacing={2} py={0.5} alignItems="center">
        <Typography style={{ flex: 1, textAlign: 'left', paddingLeft: '10px' }}>
          Bad: &gt;= {companyCarbonStandard.red_carbon_standard} kg
        </Typography>
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            alignSelf: 'center',
            marginRight: '10px',
            backgroundImage: redGradient
          }}
        ></div>
      </Stack>
      
    </>
  );
}
