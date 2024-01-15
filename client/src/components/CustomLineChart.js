import React, { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { toast } from "react-toastify";
import { baseURL } from "../utils/constant";
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

export default function CustomLineChart({ type, lineChartLength, userData, team_id }) {
  const [lineChartData, setLineChartData] = useState({});

  CustomLineChart.propTypes = {
    type: PropTypes.string.isRequired,
    lineChartLength: PropTypes.string.isRequired,
    userData: PropTypes.shape({
      id: PropTypes.number.isRequired,
      company_id: PropTypes.number.isRequired,
    }).isRequired,
    team_id: PropTypes.number.isRequired,
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
          } else {
            toast.error("Failed to fetch line chart data.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching line chart data.");
        });
    }
  }, [userData, lineChartLength, type, team_id]);

  return (
    <div>
      {lineChartData?.footprintList ? (
        <LineChart
          width={300}
          height={230}
          series={[{ data: lineChartData.footprintList, label: `${type} Avg CF` }]}
          xAxis={[{
            scaleType: 'point',
            data: lineChartData.dates,
            label: 'Last 4 ' + lineChartLength + 's',
          }]}
        />
      ) : (
        <Typography>Loading line chart...</Typography>
      )}
    </div>
  );
}
