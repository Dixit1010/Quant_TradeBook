/*
================================================================================
| FILE: app/lib/venueConfig.js (Final, Definitive Version)                     |
================================================================================
*/

export const VENUE_CONFIG = {
    Bybit: {
        wsUrl: 'wss://stream.bybit.com/v5/public/spot',
        getSubscribeMsg: (sym) => ({ op: 'subscribe', args: [`orderbook.50.${sym}`] }),
        getUnsubscribeMsg: (sym) => ({ op: 'unsubscribe', args: [`orderbook.50.${sym}`] }),
        symbolFormat: (s) => s.replace('-', ''),
        processMessage: (data) => {
            const bids = data?.data?.b;
            const asks = data?.data?.a;

            if (data?.topic?.startsWith('orderbook.') && bids && asks) {
                if (data.type === 'snapshot' || data.type === 'delta') {
                    return { bids, asks, isSnapshot: data.type === 'snapshot' };
                }
            }
            return null;
        },
        getPongMsg: () => ({ op: 'ping' })
    },
    OKX: {
        wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
        getSubscribeMsg: (sym) => ({ op: 'subscribe', args: [{ channel: 'books5', instId: sym }] }),
        getUnsubscribeMsg: (sym) => ({ op: 'unsubscribe', args: [{ channel: 'books5', instId: sym }] }),
        symbolFormat: (s) => s.replace('USDT', '-USDT'),
        processMessage: (data) => {
            const bids = data?.data?.[0]?.bids;
            const asks = data?.data?.[0]?.asks;

            if (data?.arg?.channel === 'books5' && bids && asks) {
                if (data.action === 'snapshot' || data.action === 'update') {
                    return { bids, asks, isSnapshot: true };
                }
            }
            return null;
        },
        getPongMsg: () => 'pong'
    },
    Deribit: {
        wsUrl: 'wss://www.deribit.com/ws/api/v2',
        getSubscribeMsg: (sym) => ({
            jsonrpc: '2.0',
            method: 'public/subscribe',
            params: { channels: [`book.${sym}.100ms`] }
        }),
        getUnsubscribeMsg: (sym) => ({
            jsonrpc: '2.0',
            method: 'public/unsubscribe',
            params: { channels: [`book.${sym}.100ms`] }
        }),
        symbolFormat: (s) => s.includes('-') ? s : 'BTC-PERPETUAL',
        processMessage: (data) => {
            const bids = data?.params?.data?.bids;
            const asks = data?.params?.data?.asks;
            const type = data?.params?.data?.type;

            if (data?.method === 'subscription' && bids && asks) {
                const formatOrders = (orders) => orders.map(o => [o[1], o[2]]);
                return {
                    bids: formatOrders(bids),
                    asks: formatOrders(asks),
                    isSnapshot: type === 'snapshot'
                };
            }
            return null;
        },
        // UPDATED: Correctly responds to Deribit's test request
        getPongMsg: (request) => ({
            jsonrpc: '2.0',
            id: request.id, // Echo the ID from the server's request
            method: 'public/test',
            params: {} // Params for the test response must be empty
        })
    }
};

