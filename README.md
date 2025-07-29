

GoQuant Real-Time Orderbook Viewer
This project is a real-time cryptocurrency orderbook viewer with order simulation capabilities, built as a technical assignment for GoQuant. It connects to multiple exchanges via WebSockets to display live market data and allows users to visualize the potential impact of their orders.

## Video Demonstration
A full video walkthrough demonstrating the application's features and a code review can be found here:
Link to Video Demonstration (<- Replace with your actual video link)

## Live Demo
A live, deployed version of the application is available at:
Link to Live Demo (<- Replace with your deployment link, e.g., from Vercel/Netlify)

## Features
Multi-Venue Connectivity: Connects in real-time to Bybit, OKX, and Deribit public WebSocket APIs.

Live Orderbook: Displays up to 15 levels of bids and asks, updating instantly as new data arrives.

Market Depth Chart: A dynamic, visual representation of market liquidity using the Recharts library.

Order Simulation: A comprehensive form to simulate Market and Limit orders for both Buy and Sell sides.

Timing Simulation: Simulate orders with an immediate, 5s, 10s, or 30s delay to understand timing impact.

Placement Visualization: Simulated limit orders are highlighted directly in the orderbook to show their potential placement.

Impact Analysis: Instantly calculates and displays key metrics for simulated orders:

Estimated Fill Percentage

Market Impact Percentage

Slippage Estimation

Warnings for orders with significant market impact.

Responsive Design: The UI is fully responsive and optimized for both desktop and mobile use cases.

Robust Error Handling: Includes connection timeouts and clear error messages if a data feed fails.

## Tech Stack & Libraries
Framework: Next.js (v13+ with App Router)

Language: JavaScript

Styling: Tailwind CSS

Charting: Recharts

Icons: Lucide React

## How to Run Locally
Follow these instructions to get the project running on your local machine.

Prerequisites
Node.js (version 18.x or later)

npm or yarn

Installation & Setup
Clone the repository:

git clone https://github.com/your-username/goquant-orderbook-app.git

(<- Replace with your actual GitHub repository link)

Navigate to the project directory:

cd goquant-orderbook-app

Install dependencies:

npm install

Run the development server:

npm run dev

Open your browser and navigate to http://localhost:3000 to see the application running.

## API Documentation & Considerations
This application uses public, unauthenticated WebSocket endpoints, which do not require API keys.

Bybit API:

Docs: Bybit WebSocket API v5

Endpoint Used: wss://stream.bybit.com/v5/public/spot

OKX API:

Docs: OKX WebSocket API v5

Endpoint Used: wss://ws.okx.com:8443/ws/v5/public

Deribit API:

Docs: Deribit WebSocket API v2

Endpoint Used: wss://www.deribit.com/ws/api/v2

Rate Limiting: By using WebSockets, we avoid the strict rate limits associated with REST API polling. The exchanges' public WebSocket streams are designed for high-frequency updates. The application subscribes to a single topic per connection and is well within the connection limits for public use.

Assumptions Made
The primary trading pair of interest for demonstration is BTC against a USD/USDT equivalent. The symbols (BTCUSDT, BTC-USDT, BTC-PERPETUAL) were chosen as they are the most common and consistently available across the selected exchanges.

The UI/UX is designed to be clean and functional for demonstration purposes and is not intended to be a feature-complete production trading interface.

The "Time to fill" metric was omitted as it's highly speculative and cannot be accurately estimated from orderbook data alone. Instead, the focus was placed on more deterministic metrics like slippage and market impact.

## Code Organization & Review
The project follows a standard Next.js App Router structure with a clear separation of concerns.

app/page.js: The main entry point of the application. It manages the top-level state (like the current venue) and assembles the main UI components.

app/components/: Contains all the reusable React components.

ui/: Holds generic, low-level UI elements like Button.js and Card.js.

Other files like OrderBook.js and MarketDepthChart.js are the larger, feature-specific components.

app/hooks/: This is where the core logic resides.

useOrderbook.js: This custom hook is the heart of the application. It encapsulates all logic related to WebSocket management, including connecting, subscribing, parsing messages, handling errors, managing timeouts, and cleaning up connections. This makes the main page component clean and focused on presentation.

app/lib/: Contains library code and configurations.

venueConfig.js: A centralized configuration object that holds all exchange-specific details (WebSocket URLs, subscription message formats, etc.). This design pattern makes it extremely easy to modify an existing venue or add a new one without changing the hook's logic.
