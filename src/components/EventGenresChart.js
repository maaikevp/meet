import { useState, useEffect } from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';


const EventGenresChart = ({ allLocations, events }) => {
    const [data, setData] = useState([]);
    const genres = ['React', 'JavaScript', 'Node', 'jQuery', 'Angular'];
    let genre;

    useEffect(() => {
        setData(getData());
    }, [events]);


    const getData = () => {
        const data = genres.map((genre) => {
            const filteredEvents = events.filter((event) =>
                event.summary.includes(genre)
            );

            return {
                name: genre,
                value: filteredEvents.length,
            };
        });
        return data;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius;
        const x = cx + radius * Math.cos(-midAngle * RADIAN) * 1.07;
        const y = cy + radius * Math.sin(-midAngle * RADIAN) * 1.07;
        return percent ? (
            <text
                x={x}
                y={y}
                fill="#8884d8"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
            >
                {`${genres[index]} ${(percent * 100).toFixed(0)}%`}
            </text>
        ) : null;
    };


    const colors = ['#FEAE65', '#E6F69D', '#AADEA7', '#64C2A6', '#2D87BB'];


    return (
        <ResponsiveContainer width="99%" height={400}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    fill="#8884d8"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={130}>
                    {data.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))
                    }
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default EventGenresChart;





//  Old colours:
// const colors = ['#DD0000', '#00DD00', '#0000DD', '#DDDD00', '#DD00DD'];
// const colors = ['#C1E7E3', '#2F387B', '#D394A9', '#A07F9E', '#826BA8'];
// const colors = ['#003F5C', '#58508D', '#BC5090', '#FF6361', '#FFA600'];