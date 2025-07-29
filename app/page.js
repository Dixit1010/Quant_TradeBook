// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
//       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
//           <li className="mb-2 tracking-[-.01em]">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
//               app/page.js
//             </code>
//             .
//           </li>
//           <li className="tracking-[-.01em]">
//             Save and see your changes instantly.
//           </li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }

'use client'; 

import { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

// Import all the necessary components and hooks
import { VENUE_CONFIG } from './lib/venueConfig';
import { useOrderbook } from './hooks/useOrderbook';
import { OrderBook } from './components/OrderBook';
import { MarketDepthChart } from './components/MarketDepthChart';
import { OrderSimulationForm } from './components/OrderSimulationForm';
import { Button } from './components/ui/Button';

/**
 * This is the main page component for your application.
 */
export default function Home() {
    const [venue, setVenue] = useState('Bybit');
    const [symbol, setSymbol] = useState('BTCUSDT');
    const [simulatedOrder, setSimulatedOrder] = useState(null);
    
    const { bids, asks, isLoading, error, lastUpdate } = useOrderbook(venue, symbol);

    const handleVenueChange = (newVenue) => {
        setVenue(newVenue);
        setSimulatedOrder(null); 
        if (newVenue === 'Deribit') {
            setSymbol('BTC-PERPETUAL');
        } else if (newVenue === 'OKX') {
            setSymbol('BTC-USDT');
        } else {
            setSymbol('BTCUSDT');
        }
    };

    const spread = useMemo(() => {
        if (asks.length > 0 && bids.length > 0) {
            const bestAsk = asks[0][0];
            const bestBid = bids[0][0];
            const spreadValue = bestAsk - bestBid;
            const spreadPercentage = (spreadValue / bestAsk) * 100;
            return { value: spreadValue.toFixed(2), percentage: spreadPercentage.toFixed(4) };
        }
        return { value: 'N/A', percentage: 'N/A' };
    }, [bids, asks]);

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-3 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <TrendingUp className="text-blue-500 h-8 w-8" />
                    <h1 className="text-xl font-bold">GoQuant Orderbook</h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* CORRECTION HERE:
                      We add `VENUE_CONFIG &&` before `Object.keys`.
                      This ensures that we only try to map over the keys if the
                      VENUE_CONFIG object has been successfully loaded.
                    */}
                    {VENUE_CONFIG && Object.keys(VENUE_CONFIG).map(v => (
                        <Button key={v} onClick={() => handleVenueChange(v)} variant={venue === v ? 'primary' : 'secondary'}>
                            {v}
                        </Button>
                    ))}
                </div>
            </header>

            <main className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4 xl:col-span-3 space-y-4">
                    <OrderSimulationForm 
                        symbol={symbol} 
                        bids={bids}
                        asks={asks}
                        onSimulate={setSimulatedOrder} 
                    />
                </div>

                <div className="lg:col-span-8 xl:col-span-6">
                    <MarketDepthChart 
                        bids={bids}
                        asks={asks}
                        symbol={symbol}
                        venue={venue}
                        lastUpdate={lastUpdate}
                        spread={spread}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>

                <div className="lg:col-span-12 xl:col-span-3 relative">
                    <OrderBook 
                        bids={bids} 
                        asks={asks} 
                        spread={spread}
                        simulatedOrder={simulatedOrder}
                    />
                    {isLoading && (
                        <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center rounded-lg">
                            <p>Connecting...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}