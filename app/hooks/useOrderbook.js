
/*
================================================================================
| FILE: app/hooks/useOrderbook.js (Final, Definitive Version)                  |
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

        if (ws.current) ws.current.close();
        if (dataTimeout.current) clearTimeout(dataTimeout.current);

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
                setError(`Connection timed out. No valid order book data received from ${venue}. The symbol may be unsupported or the API may have changed.`);
                setIsLoading(false);
                ws.current.close();
            }, 12000);
        };

        ws.current.onmessage = (event) => {
            if (event.data === 'ping') {
                ws.current.send('pong');
                return;
            }

            const data = JSON.parse(event.data);
            console.log(`[${venue} RAW DATA]:`, data);
            
            // UPDATED: Explicit check for Deribit's test request
            if (venue === 'Deribit' && data.method === 'heartbeat' && data.params?.type === 'test_request') {
                console.log(`[${venue}] Received Deribit test request, sending response.`);
                ws.current.send(JSON.stringify(config.getPongMsg(data)));
                return;
            }

            if (data.event || data.success === true || data.result) {
                console.log(`[${venue}] Received subscription confirmation or info message.`);
                return;
            }

            const newOrders = config.processMessage(data);
            if (newOrders) {
                if (dataTimeout.current) {
                    clearTimeout(dataTimeout.current);
                    dataTimeout.current = null;
                }
                if (isLoading) {
                    setIsLoading(false);
                }

                if (newOrders.isSnapshot) {
                    localBids.clear();
                    localAsks.clear();
                }

                const updateOrderBook = (currentBook, updates) => {
                    updates.forEach(([price, size]) => {
                        const priceNum = parseFloat(price);
                        const sizeNum = parseFloat(size);
                        if (sizeNum === 0) currentBook.delete(priceNum);
                        else currentBook.set(priceNum, sizeNum);
                    });
                };

                updateOrderBook(localBids, newOrders.bids || []);
                updateOrderBook(localAsks, newOrders.asks || []);

                setBids(Array.from(localBids.entries()).sort((a, b) => b[0] - a[0]));
                setAsks(Array.from(localAsks.entries()).sort((a, b) => a[0] - b[0]));
                setLastUpdate(new Date());
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
