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

	const isSingleTeamUser = Array.isArray(teams) && teams.length === 1

	return (
		<>
			{teams.map((team) => (
				<Box key={team.teamName}>
					<hr />
					<Typography>{team.teamName}</Typography>

					<TextField
						//label="Percentage"
						size="small"
						style={{ width: '100%' }}
						value={isSingleTeamUser ? 100 : teamPercentages[team.teamName] || ''}
						InputProps={{
							endAdornment: <InputAdornment position="end">%</InputAdornment>,
						}}
						onChange={(event) => handleTeamPercentageChange(event, team.teamName)}
					/>
					<Typography sx={{ fontSize: '14px', py: 1 }}>
						Carbon Footprint:{' '}
						{teamPercentages[team.teamName]
							? (
								(parseFloat(teamPercentages[team.teamName]) / 100) *
								parseFloat(carbonFootprint)
							).toFixed(2)
							: 'N/A'}
						kg CO2
					</Typography>

				</Box>
			))}
		</>
	);
}
