import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Animal } from '../services/api';

interface BreedPieChartProps {
  animals: Animal[];
}

const COLORS = [
  '#0ea5e9', // sky-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#14b8a6', // teal-500
];

export default function BreedPieChart({ animals }: BreedPieChartProps) {
  const data = useMemo(() => {
    const breedCounts: Record<string, number> = {};
    animals.forEach(animal => {
      const breed = animal.breed || 'Unknown';
      breedCounts[breed] = (breedCounts[breed] || 0) + 1;
    });
    
    const sortedData = Object.entries(breedCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Group smaller amounts into 'Other' if there are too many breeds
    if (sortedData.length > 8) {
      const topBreeds = sortedData.slice(0, 7);
      const otherBreeds = sortedData.slice(7);
      const otherTotal = otherBreeds.reduce((acc, curr) => acc + curr.value, 0);
      return [...topBreeds, { name: 'Other', value: otherTotal }];
    }

    return sortedData;
  }, [animals]);

  if (!animals || animals.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-slate-500 font-medium italic">No breed data available</p>
      </div>
    );
  }

  // Custom label rendering to look cleaner against the dark background
  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    // Calculate a position slightly outside the pie
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is > 5% to avoid clutter
    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          innerRadius={60}
          fill="#8884d8"
          dataKey="value"
          label={renderCustomizedLabel}
          paddingAngle={2}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
            backdropFilter: 'blur(8px)',
            borderColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '0.75rem', 
            color: '#f1f5f9',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
          }}
          itemStyle={{ color: '#f1f5f9', fontWeight: 500 }}
          formatter={(value: any, name: any) => [value, name]}
        />
        <Legend 
          wrapperStyle={{ 
            fontSize: '12px', 
            color: '#cbd5e1',
            paddingTop: '20px'
          }} 
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
