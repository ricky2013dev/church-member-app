import React from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
} from 'recharts';
import type { WeeklyStats } from '../types';

interface WeeklyChartProps {
  data: WeeklyStats[];
  selectedWeeks: string[];
  onWeekClick: (week: string) => void;
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ 
  data, 
  selectedWeeks, 
  onWeekClick 
}) => {
  // Transform data for chart display
  const chartData = data.map(stat => ({
    ...stat,
    weekDisplay: new Date(stat.week).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    isSelected: selectedWeeks.includes(stat.week),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">Week of {label}</p>
          <p className="tooltip-value">
            New Families: <span style={{ color: '#2563eb' }}>{data.new_families}</span>
          </p>
          <p className="tooltip-value">
            Total Families: <span style={{ color: '#059669' }}>{data.total_families}</span>
          </p>
          <p className="tooltip-hint">Click to select/deselect</p>
        </div>
      );
    }
    return null;
  };

  // Handle bar click
  const handleBarClick = (data: any) => {
    if (data && data.week) {
      onWeekClick(data.week);
    }
  };

  return (
    <div className="weekly-chart-container">
      <div className="chart-header">
        <h3>Weekly Registration Trends</h3>
        <p>Click on bars to filter families by week</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="weekDisplay" 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* New families bars */}
          <Bar 
            dataKey="new_families" 
            fill="#2563eb"
            name="New Families"
            cursor="pointer"
            onClick={handleBarClick}
          />
          
          {/* Total families line overlay */}
          <Line
            type="monotone"
            dataKey="total_families"
            stroke="#059669"
            strokeWidth={2}
            dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
            name="Total Families"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#2563eb' }}></div>
          <span>New Families (Weekly)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#059669' }}></div>
          <span>Total Families (Cumulative)</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;