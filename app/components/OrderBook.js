/*
================================================================================
| FILE: app/components/OrderBook.js (Corrected)                                |
================================================================================
*/
'use client';
import { useMemo } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';

// This 'export' is critical
export const OrderBook = ({ bids, asks, spread, simulatedOrder }) => {
    const orderbookData = useMemo(() => {
        let bidTotal = 0;
        const processedBids = bids.slice(0, 15).map(([price, size]) => {
            bidTotal += size;
            return { price, size, total: bidTotal };
        });

        let askTotal = 0;
        const processedAsks = asks.slice(0, 15).map(([price, size]) => {
            askTotal += size;
            return { price, size, total: askTotal };
        });
        return { bids: processedBids, asks: processedAsks };
    }, [bids, asks]);

    const isSimulatedLevel = (price, side) => {
        if (!simulatedOrder || simulatedOrder.side !== side || simulatedOrder.type === 'Market') return false;
        
        const simPriceNum = simulatedOrder.price;
        if (side === 'Buy') {
            const targetAsk = asks.find(([p]) => p >= simPriceNum);
            return targetAsk ? price === targetAsk[0] : false;
        } else { // Sell
            const targetBid = bids.find(([p]) => p <= simPriceNum);
            return targetBid ? price === targetBid[0] : false;
        }
    };

    const OrderbookRow = ({ price, size, total, type, isSimulated }) => {
        const maxTotal = useMemo(() => {
            if (type === 'bid') {
                return orderbookData.bids.length > 0 ? orderbookData.bids[orderbookData.bids.length - 1].total : 0;
            }
            return orderbookData.asks.length > 0 ? orderbookData.asks[orderbookData.asks.length - 1].total : 0;
        }, [type]);

        const barWidth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
        const colorClass = type === 'bid' ? 'bg-green-500/20' : 'bg-red-500/20';
        const textColor = type === 'bid' ? 'text-green-400' : 'text-red-400';
        const simulatedClass = isSimulated ? `ring-2 ring-yellow-400 ring-inset` : '';
        const priceFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const sizeFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

        return (
            <div className={`relative flex justify-between items-center text-xs p-1 font-mono ${simulatedClass}`}>
                <div className={`absolute top-0 bottom-0 ${type === 'bid' ? 'right-0' : 'left-0'} ${colorClass}`} style={{ width: `${barWidth}%` }}></div>
                <span className={`z-10 ${textColor}`}>{priceFormatter.format(price)}</span>
                <span className="z-10 text-gray-200">{sizeFormatter.format(size)}</span>
                <span className="z-10 text-gray-400">{sizeFormatter.format(total)}</span>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader><h2 className="font-bold text-lg">Order Book</h2></CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-3 text-xs text-gray-400 p-2 border-b border-gray-700">
                    <span>Price (USD)</span>
                    <span className="text-right">Size (BTC)</span>
                    <span className="text-right">Total (BTC)</span>
                </div>
                <div className="h-[250px] overflow-y-auto">
                    {orderbookData.asks.slice().reverse().map(d => <OrderbookRow key={`ask-${d.price}`} {...d} type="ask" isSimulated={isSimulatedLevel(d.price, 'Buy')} />)}
                </div>
                <div className="p-2 my-1 border-y border-gray-600 text-center font-bold text-lg">
                    {spread.value !== 'N/A' && asks.length > 0 && bids.length > 0 ? `$${((asks[0][0] + bids[0][0]) / 2).toFixed(2)}` : '...'}
                </div>
                <div className="h-[250px] overflow-y-auto">
                    {orderbookData.bids.map(d => <OrderbookRow key={`bid-${d.price}`} {...d} type="bid" isSimulated={isSimulatedLevel(d.price, 'Sell')} />)}
                </div>
            </CardContent>
        </Card>
    );
};

