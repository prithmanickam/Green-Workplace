import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Typography, Stack, Select, MenuItem } from '@mui/material';

const CustomBarChart = ({ officeChartData, selectedOffice, handleOfficeChange, offices }) => {
	return (
		<>

			<BarChart
				xAxis={[{ scaleType: 'band', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], label: 'Days' }]}
				series={[{
					data: officeChartData,
					color: '#eed202',
					label: 'No. of Employees in Office',
				}]}
				width={300}
				height={200}
			/>

			<Stack direction="row" spacing={2} alignItems="center">
				<Typography variant="h8" paragraph>
					Select Office:
				</Typography>

				<Select
					value={selectedOffice}
					onChange={handleOfficeChange}
				>

					{offices.map((office) => (
						<MenuItem key={office} value={office}>{office}</MenuItem>
					))}
				</Select>

			</Stack>
		</>
	);
};

export default React.memo(CustomBarChart);
