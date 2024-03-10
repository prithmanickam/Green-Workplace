import React from 'react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { Tooltip, IconButton } from '@mui/material';

const CarbonChangeIndicator = ({ currentFootprint, lastWeeksFootprint }) => {
  const percentageChange = lastWeeksFootprint ? (((currentFootprint - lastWeeksFootprint) / lastWeeksFootprint) * 100).toFixed(1) : 0;
  let Icon = DragHandleIcon; 
  let iconColor = 'action';
  let title = 'No change from last week';

  if (percentageChange > 0) {
    Icon = ArrowCircleUpIcon;
    iconColor = '#C00000';
    title = `${percentageChange}% increase from last week`;
  } else if (percentageChange < 0) {
    Icon = ArrowCircleDownIcon;
    iconColor = '#008E00';
    title = `${percentageChange}% decrease from last week`;
  }

  return (
    <Tooltip title={title} arrow>
      <IconButton>
        <Icon fontSize="large"  sx={{ color: iconColor }}  />
      </IconButton>
    </Tooltip>
  );
};

export default CarbonChangeIndicator;