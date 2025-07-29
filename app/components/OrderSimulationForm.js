
/*
================================================================================
| FILE: app/components/OrderSimulationForm.js (Corrected)                      |
================================================================================
*/
'use client';
import { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';

export const OrderSimulationForm = ({ symbol, bids, asks, onSimulate }) => {
    const [orderType, setOrderType] = useState('Limit');
    const [side, setSide] = useState('Buy');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [delay, setDelay] = useState(0);
    const [simulatedOrder, setSimulatedOrder] = useState(null);

    const handleSimulate = useCallback(() => {
        const priceNum = parseFloat(price);
        const quantityNum = parseFloat(quantity);

        if (orderType === 'Limit' && (isNaN(priceNum) || priceNum <= 0)) {
            alert('Please enter a valid price for a limit order.');
            return;
        }
        if (isNaN(quantityNum) || quantityNum <= 0) {
            alert('Please enter a valid quantity.');
            return;
        }
        
        const order = {
            type: orderType,
            side: side,
            price: orderType === 'Limit' ? priceNum : (side === 'Buy' ? Infinity : 0),
            quantity: quantityNum,
        };
        
        onSimulate(null);
        setSimulatedOrder(null);
        
        if (delay > 0) {
            setTimeout(() => { onSimulate(order); setSimulatedOrder(order); }, delay * 1000);
        } else {
            onSimulate(order);
            setSimulatedOrder(order);
        }
    }, [price, quantity, orderType, side, delay, onSimulate]);

    const simulationMetrics = useMemo(() => {
        if (!simulatedOrder) return null;

        const { price, quantity, side } = simulatedOrder;
        const book = side === 'Buy' ? asks : bids;
        let filledQuantity = 0;
        let totalCost = 0;
        const marketPrice = side === 'Buy' ? asks[0]?.[0] : bids[0]?.[0];

        if (!marketPrice) return null;

        for (const [levelPrice, levelSize] of book) {
            const priceCondition = side === 'Buy' ? levelPrice <= price : levelPrice >= price;
            if (orderType === 'Market' || priceCondition) {
                const canFill = Math.min(quantity - filledQuantity, levelSize);
                filledQuantity += canFill;
                totalCost += canFill * levelPrice;
                if (filledQuantity >= quantity) break;
            }
        }
        
        const avgFillPrice = filledQuantity > 0 ? totalCost / filledQuantity : 0;
        const fillPct = (filledQuantity / quantity) * 100;
        const slippage = (marketPrice > 0 && avgFillPrice > 0) ? Math.abs((avgFillPrice - marketPrice) / marketPrice) * 100 : 0;
        const totalBookDepth = book.reduce((acc, curr) => acc + curr[1], 0);
        const marketImpact = totalBookDepth > 0 ? (quantity / totalBookDepth) * 100 : 0;

        return {
            fillPct: fillPct.toFixed(2),
            marketImpact: marketImpact.toFixed(4),
            slippage: slippage.toFixed(2),
            warning: marketImpact > 5 ? 'High market impact expected!' : null,
        };
    }, [simulatedOrder, bids, asks, orderType]);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader><h2 className="font-bold text-lg">Order Simulation</h2></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400">Side</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <Button onClick={() => setSide('Buy')} className="w-full" variant={side === 'Buy' ? 'primary' : 'secondary'}>Buy</Button>
                            <Button onClick={() => setSide('Sell')} className="w-full" variant={side === 'Sell' ? 'danger' : 'secondary'}>Sell</Button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Order Type</label>
                        {/* Adding suppressHydrationWarning to all form elements that might be modified by extensions */}
                        <select value={orderType} onChange={e => setOrderType(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mt-1 text-sm" suppressHydrationWarning={true}>
                            <option>Limit</option><option>Market</option>
                        </select>
                    </div>
                    {orderType === 'Limit' && (
                        <div>
                            <label className="text-xs text-gray-400">Price ({(symbol.split('-')[1] || 'USD').replace('USDT', 'USD')})</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 65000.50" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mt-1 text-sm" suppressHydrationWarning={true} />
                        </div>
                    )}
                    <div>
                        <label className="text-xs text-gray-400">Quantity (BTC)</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g., 0.5" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mt-1 text-sm" suppressHydrationWarning={true} />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Timing</label>
                        <select value={delay} onChange={e => setDelay(parseInt(e.target.value))} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 mt-1 text-sm" suppressHydrationWarning={true}>
                            <option value={0}>Immediate</option><option value={5}>5s Delay</option><option value={10}>10s Delay</option><option value={30}>30s Delay</option>
                        </select>
                    </div>
                    <Button onClick={handleSimulate} className="w-full !mt-6" variant="primary">Simulate Order</Button>
                </CardContent>
            </Card>

            {simulationMetrics && (
                <Card>
                    <CardHeader><h2 className="font-bold text-lg">Simulation Impact</h2></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Est. Fill %:</span> <span>{simulationMetrics.fillPct}%</span></div>
                        <div className="flex justify-between"><span>Market Impact:</span> <span>{simulationMetrics.marketImpact}%</span></div>
                        <div className="flex justify-between"><span>Slippage:</span> <span>{simulationMetrics.slippage}%</span></div>
                        {simulationMetrics.warning && <p className="text-yellow-400 text-xs pt-2">{simulationMetrics.warning}</p>}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
