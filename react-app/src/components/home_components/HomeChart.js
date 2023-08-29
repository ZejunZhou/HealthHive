import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, LabelList, Rectangle} from 'recharts';

function HealthIndexChart({ data }) {
    const isDataEmpty = !data || data.length === 0;

    return (
        <div>
             <h1>Your Health Index Trends</h1>
            <ResponsiveContainer width="100%" height={450}>
                <LineChart data={data} margin={{ top: 5, right: 30, left: 50, bottom: 20 }}>
                    {isDataEmpty && <Rectangle x={0} y={0} width="100%" height="100%"/>}
                    
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    label={{ value: 'date', position: 'insideBottomRight', offset: 0 }}
                />

                    <YAxis 
                    label={{ value: 'health_index', angle: -90, position: 'insideLeft', offset: 10 }}
                />

                    <Tooltip />

                    {isDataEmpty ? (
                        <>
                            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize={20}>
                                You have not got your health index yet,
                            </text>
                            <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" fontSize={20}>
                                Please go to Wellness Forecast to calculate your index
                            </text>
                        </>
                    ) : (
                        <>
                            <Legend />
                            <Line type="monotone" dataKey="health_index" stroke="#8884d8" name='Health Index'>
                            </Line>
                        </>
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default HealthIndexChart;
