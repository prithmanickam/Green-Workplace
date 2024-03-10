import React, { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { toast } from "react-toastify";
import { baseURL } from "../utils/constant";
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';

function CustomLineChart({ type, userData, team_id, setLastWeeksFootprint }) {
  const [lineChartData, setLineChartData] = useState({
    footprintList: [],
    dates: []
  });
  const [lineChartLength, setLineChartLength] = useState('week');

  CustomLineChart.propTypes = {
    type: PropTypes.string.isRequired,
    userData: PropTypes.shape({
      id: PropTypes.number.isRequired,
      company_id: PropTypes.number.isRequired,
    }).isRequired,
    team_id: PropTypes.number.isRequired,
    setLastWeeksFootprint: PropTypes.func,
  };

  useEffect(() => {
    if (userData) {
      fetch(`${baseURL}/getLineChartData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: type,
          lineChartLength: lineChartLength,
          user_id: userData.id,
          team_id: team_id,
          company_id: userData.company_id
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setLineChartData(data.data);
            const lastWeeksValue = data.data.footprintList[data.data.footprintList.length - 1];
            if (setLastWeeksFootprint) {
              setLastWeeksFootprint(lastWeeksValue);
            }
          } else {
            toast.error("Failed to fetch line chart data.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching line chart data.");
        });
    }
  }, [userData, lineChartLength, type, team_id, setLastWeeksFootprint]);

  const handleLineChartLengthChange = (length) => {
    setLineChartLength(length);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">

      <LineChart
        width={300}
        height={230}
        series={[{ data: lineChartData.footprintList, label: `${type.charAt(0).toUpperCase() + type.slice(1)} Avg CF` }]}
        xAxis={[{
          scaleType: 'point',
          data: lineChartData.dates,
          label: 'Last 4 ' + lineChartLength + 's',
        }]}
      />

      <Box marginTop={2}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleLineChartLengthChange('week')}
          style={{
            borderColor: lineChartLength === 'week' ? '#02B2AF' : 'grey',
            color: lineChartLength === 'week' ? '#02B2AF' : 'grey',
            marginRight: '10px'
          }}
        >
          Week
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleLineChartLengthChange('month')}
          style={{
            borderColor: lineChartLength === 'month' ? '#02B2AF' : 'grey',
            color: lineChartLength === 'month' ? '#02B2AF' : 'grey'
          }}
        >
          Month
        </Button>
      </Box>
    </Box>
  );
}

export default React.memo(CustomLineChart);