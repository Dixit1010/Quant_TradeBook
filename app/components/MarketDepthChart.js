
/*
================================================================================
| FILE: app/components/MarketDepthChart.js (Corrected)                         |
================================================================================
*/
'use client';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardHeader, CardContent } from './ui/Card';

// This 'export' is critical
export const MarketDepthChart = ({ bids, asks, symbol, venue, lastUpdate, spread, isLoading, error }) => {
    const depthChartData = useMemo(() => {
        if (!bids.length || !asks.length) return [];
        
        let cumulativeBidSize = 0;
        const bidData = bids.slice().reverse().map(([price, size]) => {
            cumulativeBidSize += size;
            return { price, Bids: cumulativeBidSize, Asks: undefined };
        });

        let cumulativeAskSize = 0;
        const askData = asks.map(([price, size]) => {
            cumulativeAskSize += size;
            return { price, Asks: cumulativeAskSize, Bids: undefined };
        });
        
        const midPrice = (asks[0][0] + bids[0][0]) / 2;
        const range = midPrice * 0.05;
        
        return [...bidData, ...askData].filter(d => d.price > midPrice - range && d.price < midPrice + range);
    }, [bids, asks]);

    return (
        <Card>
            <CardHeader className="flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-lg">{symbol} Market Depth</h2>
                    <p className="text-xs text-gray-400">{venue} | Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'N/A'}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Spread</p>
                    <p className="font-mono">{spread.value} ({spread.percentage}%)</p>
                </div>
            </CardHeader>
            <CardContent className="h-[450px]">
                {isLoading ? <div className="flex items-center justify-center h-full">Loading Chart...</div> : 
                 error ? <div className="flex items-center justify-center h-full text-red-400">{error}</div> :
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={depthChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="price" stroke="#9CA3AF" tick={{fontSize: 10}} tickFormatter={(price) => `$${Number(price).toFixed(0)}`} />
                        <YAxis stroke="#9CA3AF" tick={{fontSize: 10}} tickFormatter={(val) => `${val.toFixed(0)}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                        <Area type="step" dataKey="Bids" stroke="#10B981" fill="#10B981" fillOpacity={0.3} connectNulls />
                        <Area type="step" dataKey="Asks" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} connectNulls />
                    </AreaChart>
                </ResponsiveContainer>}
            </CardContent>
        </Card>
    );
};