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
import type { MonthlyStats } from '../types';
import styles from './MonthlyChart.module.css';

interface MonthlyChartProps {
  data: MonthlyStats[];
  selectedMonths: string[];
  onMonthClick: (month: string) => void;
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ 
  data, 
  selectedMonths, 
  onMonthClick 
}) => {
  // Transform data for chart display
  const chartData = data.map(stat => ({
    ...stat,
    monthDisplay: new Date(stat.month + '-01').toLocaleDateString('en-US', { 
      month: 'short', 
      year: '2-digit' 
    }),
    isSelected: selectedMonths.includes(stat.month),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">Month of {label}</p>
          <p className="tooltip-value">
            New Families: <span style={{ color: '#dc2626' }}>{data.new_families}</span>
          </p>
          <p className="tooltip-value">
            Total Families: <span style={{ color: '#ea580c' }}>{data.total_families}</span>
          </p>
          <p className="tooltip-hint">Click to select/deselect</p>
        </div>
      );
    }
    return null;
  };

  // Handle bar click
  const handleBarClick = (data: any) => {
    if (data && data.month) {
      onMonthClick(data.month);
    }
  };

  return (
    <div className={styles.monthlyChart}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Monthly Trends</h3>
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
            dataKey="monthDisplay" 
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
            fill="#dc2626"
            name="New Families"
            cursor="pointer"
            onClick={handleBarClick}
          />
          
          {/* Total families line overlay */}
          <Line
            type="monotone"
            dataKey="total_families"
            stroke="#ea580c"
            strokeWidth={2}
            dot={{ fill: '#ea580c', strokeWidth: 2, r: 4 }}
            name="Total Families"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className={styles.chartLegend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.legendColorMonthly}`}></div>
          <span>New Families (Monthly)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendColor} ${styles.legendColorTotal}`}></div>
          <span>Total Families (Cumulative)</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyChart;