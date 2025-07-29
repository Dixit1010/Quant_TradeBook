
/*
================================================================================
| FILE: app/hooks/useOrderbook.js (Improved Logic)                             |
================================================================================
*/
'use client';
import { useState, useEffect, useRef } from 'react';
import { VENUE_CONFIG } from '../lib/venueConfig';

export const useOrderbook = (venue, symbol) => {
    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const ws = useRef(null);
    const dataTimeout = useRef(null);

    useEffect(() => {
        if (!VENUE_CONFIG) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setBids([]);
        setAsks([]);
        if (ws.current) {
            ws.current.close();
        }
        if (dataTimeout.current) {
            clearTimeout(dataTimeout.current);
        }
        
        const config = VENUE_CONFIG[venue];
        if (!config) {
            setError(`Invalid venue configuration: ${venue}`);
            setIsLoading(false);
            return;
        }
        const formattedSymbol = config.symbolFormat(symbol);

        ws.current = new WebSocket(config.wsUrl);
        
        const localBids = new Map();
        const localAsks = new Map();

        ws.current.onopen = () => {
            console.log(`[${venue}] WebSocket Connected. Subscribing to ${formattedSymbol}...`);
            ws.current.send(JSON.stringify(config.getSubscribeMsg(formattedSymbol)));

            dataTimeout.current = setTimeout(() => {
                if (bids.length === 0 && asks.length === 0) {
                    setError(`Connection timed out. No order book data received from ${venue} for ${formattedSymbol}. The symbol may be incorrect or the API may have changed.`);
                    setIsLoading(false);
                }
            }, 10000);
        };

        ws.current.onmessage = (event) => {
            console.log(`[${venue} RAW DATA]:`, event.data);
            const data = JSON.parse(event.data);

            // UPDATED: More robust check for success/info messages
            if (data.success === true || (data.event && ["subscribe", "info"].includes(data.event)) || data.result) {
                console.log(`[${venue}] Received subscription confirmation or info message.`);
                return;
            }

            if (data.method === 'heartbeat') {
                if (data.method === 'test') { // For Deribit
                    ws.current.send(JSON.stringify({ jsonrpc: '2.0', method: 'public/test', params: {} }));
                }
                return;
            }

            const newOrders = config.processMessage(data);
            if (newOrders) {
                if (dataTimeout.current) {
                    clearTimeout(dataTimeout.current);
                    dataTimeout.current = null;
                }

                if (newOrders.isSnapshot) {
                    localBids.clear();
                    localAsks.clear();
                }

                const updateOrderBook = (currentBook, updates) => {
                    updates.forEach(([price, size]) => {
                        const priceNum = parseFloat(price);
                        const sizeNum = parseFloat(size);
                        if (sizeNum === 0) {
                            currentBook.delete(priceNum);
                        } else {
                            currentBook.set(priceNum, sizeNum);
                        }
                    });
                };

                updateOrderBook(localBids, newOrders.bids || []);
                updateOrderBook(localAsks, newOrders.asks || []);

                const sortedBids = Array.from(localBids.entries()).sort((a, b) => b[0] - a[0]);
                const sortedAsks = Array.from(localAsks.entries()).sort((a, b) => a[0] - b[0]);

                setBids(sortedBids);
                setAsks(sortedAsks);
                setLastUpdate(new Date());

                if (isLoading) setIsLoading(false);
            }
        };

        ws.current.onerror = (err) => {
            console.error(`[${venue}] WebSocket Error:`, err);
            setError(`Failed to connect to ${venue}. Check the browser console for details.`);
            setIsLoading(false);
            if (dataTimeout.current) clearTimeout(dataTimeout.current);
        };

        ws.current.onclose = () => {
            console.log(`[${venue}] WebSocket Disconnected`);
            if (dataTimeout.current) clearTimeout(dataTimeout.current);
        };

        return () => {
            if (ws.current) {
                ws.current.close();
            }
            if (dataTimeout.current) {
                clearTimeout(dataTimeout.current);
            }
        };
    }, [venue, symbol]);

    return { bids, asks, isLoading, error, lastUpdate };
};
