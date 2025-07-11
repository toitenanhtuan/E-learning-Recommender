// trong frontend/src/components/analytics/SkillGapPieChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PieChartProps {
    known: number;
    gap: number;
}

const COLORS = ['#4F46E5', '#F59E0B']; // Indigo cho "đã biết", Amber cho "cần học"

const SkillGapPieChart: React.FC<PieChartProps> = ({ known, gap }) => {
    const data = [
        { name: 'Skills You Know', value: known },
        { name: 'Skills to Learn (Gap)', value: gap },
    ];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => percent !== undefined ? `${(percent * 100).toFixed(0)}%` : ""}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default SkillGapPieChart;