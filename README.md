# GoQuant Real-Time Orderbook Viewer

This project is a real-time cryptocurrency orderbook viewer with order simulation capabilities, built as a technical assignment for GoQuant. It connects to multiple exchanges via WebSockets to display live market data and allows users to visualize the potential impact of their orders.

---

## 📽️ Video Demonstration

A full walkthrough demonstrating the application's features and a code review:

👉 [Video Demonstration](https://drive.google.com/file/d/11VOTnOQxjevLqFS0JxMz4_NV5F7k0BYg/view?usp=sharing)  


---

## 🚀 Documentation

A live deployed version of the app:

👉 [Document](https://docs.google.com/document/d/1HouA2D_0a0wILvT0q7iCiDIDrMJEzyegLjwAMT0JX9k/edit?usp=sharing)  


---

## ✨ Features

- **🧩 Multi-Venue Connectivity** — Real-time WebSocket connections to:
  - Bybit
  - OKX
  - Deribit

- **📊 Live Orderbook** — Displays top 15 bid/ask levels with real-time updates.

- **📈 Market Depth Chart** — Visualizes market liquidity using Recharts.

- **📝 Order Simulation**
  - Simulate **Market** and **Limit** orders
  - Supports **Buy/Sell** with timing delays (0s, 5s, 10s, 30s)

- **📍 Placement Visualization** — Highlights simulated limit orders directly in the orderbook.

- **📉 Impact Analysis**
  - Estimated Fill %
  - Market Impact %
  - Slippage
  - Warning on high impact trades

- **📱 Responsive UI** — Fully optimized for both desktop and mobile.

- **⚠️ Robust Error Handling** — Graceful fallbacks on WebSocket errors or disconnects.

---

## 🛠 Tech Stack

| Category       | Tool              |
|----------------|-------------------|
| Framework      | [Next.js 13+ (App Router)](https://nextjs.org/) |
| Language       | JavaScript        |
| Styling        | Tailwind CSS      |
| Charting       | Recharts          |
| Icons          | Lucide React      |

---

## 🧑‍💻 Getting Started Locally

### ✅ Prerequisites

- Node.js (v18.x or later)
- npm or yarn

### 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Dixit1010/Quant_TradeBook.git

# Navigate to the project folder
cd goquant-orderbook-app

# Install dependencies
npm install

# Start the dev server
npm run dev
