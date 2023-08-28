import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label, LabelList, Rectangle} from 'recharts';

function HealthIndexChart({ data }) {
    const isDataEmpty = !data || data.length === 0;

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                {isDataEmpty && <Rectangle x={0} y={0} width="100%" height="100%"/>}
                
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date">
                    <Label value="Date" offset={-15} position="insideBottomRight" />
                </XAxis>

                <YAxis>
                    <Label value="Health Index" angle={-90} position="insideLeft" offset={10} />
                </YAxis>

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
                        <Line type="monotone" dataKey="health_index" stroke="#8884d8" activeDot={{ r: 8 }}>
                            <LabelList dataKey="health_index" position="top" offset={10} />
                        </Line>
                    </>
                )}
            </LineChart>
        </ResponsiveContainer>
    );
}

export default HealthIndexChart;
