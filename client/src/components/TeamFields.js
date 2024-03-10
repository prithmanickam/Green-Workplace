import React from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import PropTypes from 'prop-types';

export default function TeamFields({ teams, teamPercentages, handleTeamPercentageChange, carbonFootprint }) {
	TeamFields.propTypes = {
		teams: PropTypes.array.isRequired,
		teamPercentages: PropTypes.object.isRequired,
		handleTeamPercentageChange: PropTypes.func.isRequired,
		carbonFootprint: PropTypes.string.isRequired
	};
	
	return (
		<>
			{teams.map((team) => (
				<Box key={team.teamName}>
					<hr />
					<Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography sx={{ flexGrow: 1, mr: 2 }}>
                            {team.teamName}
                        </Typography>

                        <TextField
                            size="small"
                            style={{ width: '30%' }} 
                            InputProps={{
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            }}
                            onChange={(event) => handleTeamPercentageChange(event, team.teamName)}
                        />
                    </Box>
					<Typography sx={{ fontSize: '14px', py: 1 }}>
						Carbon Footprint:{' '}
						{teamPercentages[team.teamName]
							? (
								(parseFloat(teamPercentages[team.teamName]) / 100) *
								parseFloat(carbonFootprint)
							).toFixed(2)
							: 'N/A'}
						kg CO2e
					</Typography>

				</Box>
			))}
		</>
	);
}
