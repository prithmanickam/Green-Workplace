import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';

const CustomPieChart = ({ data }) => {
  const chartData = Object.keys(data)
    .filter(key => data[key] > 0)
    .map((key, index) => ({
      id: index,
      value: parseFloat(data[key]),
      label: key
    }));

  const options = {
    plugins: {
      legend: {
        labels: {
          font: {
            size: 10
          }
        }
      }
    },
  };

  return (
    <PieChart
      series={[
        {
          data: chartData,
          highlightScope: { faded: 'global', highlighted: 'item' },
          faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
          paddingAngle: 2,
          cornerRadius: 5,
          innerRadius: 30,
        },
      ]}
      options={options}
      height={200}
    />
  );
};

export default React.memo(CustomPieChart);
