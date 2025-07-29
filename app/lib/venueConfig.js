/*
================================================================================
| FILE: app/lib/venueConfig.js (Corrected Subscription Topics)                 |
================================================================================
*/

export const VENUE_CONFIG = {
    Bybit: {
        wsUrl: 'wss://stream.bybit.com/v5/public/spot',
        // UPDATED: Using 'orderbook.1' which is a more common and reliable topic.
        // The '50' level depth might not be available for all symbols.
        getSubscribeMsg: (sym) => ({ op: 'subscribe', args: [`orderbook.1.${sym}`] }),
        getUnsubscribeMsg: (sym) => ({ op: 'unsubscribe', args: [`orderbook.1.${sym}`] }),
        symbolFormat: (s) => s.replace('-', ''), // e.g., BTCUSDT
        processMessage: (data) => {
            if (data.topic && data.topic.startsWith('orderbook.')) {
                 if (data.type === 'snapshot' || data.type === 'delta') {
                    return { bids: data.data.b, asks: data.data.a, isSnapshot: data.type === 'snapshot' };
                }
            }
            return null;
        }
    },
    OKX: {
        wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
        // UPDATED: Using 'books5' for 5 levels of depth, a very standard channel.
        getSubscribeMsg: (sym) => ({ op: 'subscribe', args: [{ channel: 'books5', instId: sym }] }),
        getUnsubscribeMsg: (sym) => ({ op: 'unsubscribe', args: [{ channel: 'books5', instId: sym }] }),
        symbolFormat: (s) => s.replace('USDT', '-USDT'), // e.g., BTC-USDT
        processMessage: (data) => {
            if (data.arg?.channel === 'books5') {
                // OKX sends a full snapshot in an 'update' action for this channel
                if (data.action === 'snapshot' || data.action === 'update') {
                    return { bids: data.data[0].bids, asks: data.data[0].asks, isSnapshot: true };
                }
            }
            return null;
        }
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
        symbolFormat: (s) => s.includes('-') ? s : 'BTC-PERPETUAL', // e.g., BTC-PERPETUAL
        processMessage: (data) => {
            if (data.method === 'subscription' && data.params?.channel.startsWith('book.')) {
                const { bids, asks, type } = data.params.data;
                // Deribit format is [type, price, amount]
                const formatOrders = (orders) => orders.map(o => [o[1], o[2]]);
                return { 
                    bids: formatOrders(bids), 
                    asks: formatOrders(asks), 
                    isSnapshot: type === 'snapshot' 
                };
            }
            return null;
        }
    }
};
