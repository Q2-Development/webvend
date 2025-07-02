# WebVend Frontend

A Next.js frontend for the Project Web-Vend AI vending machine simulation.

## Features

- **Simulation Dashboard**: Real-time view of AI agent behavior and inventory management
- **Financial Tracking**: Monitor cash balance, inventory value, and profit margins
- **Transaction Logging**: Real-time transaction history with sales and purchases
- **Model Selection**: Switch between different AI models to compare strategies
- **Inventory Display**: Visual representation of current stock levels, pricing, and margins
- **Activity Logging**: Track AI agent decisions and customer interactions
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the frontend directory:
   ```bash
   # Backend API URL
   BACKEND_URL=http://localhost:8000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

- `/` - Overview page explaining the Project Vend experiment
- `/dashboard` - Main simulation dashboard with real-time data

## API Integration

The frontend communicates with the backend through proxy API routes:

- `/api/vending/inventory` - Fetches current inventory data with vendor costs and retail prices
- `/api/vending/balance` - Retrieves current cash balance
- `/api/vending/transactions` - Gets transaction history
- `/api/models` - Retrieves available AI models

## New Features

### Financial Dashboard
- **Cash Balance**: Real-time tracking of available funds
- **Inventory Value**: Total retail value of current stock
- **Total Cost**: Total vendor cost of current inventory
- **Gross Profit**: Calculated profit margin

### Enhanced Inventory Display
- **Dual Pricing**: Shows both vendor cost and retail price
- **Margin Calculation**: Displays profit margin per item
- **Stock Indicators**: Visual stock level indicators

### Transaction Logging
- **Real-time Updates**: Live transaction feed
- **Transaction Types**: Distinguishes between sales and purchases
- **Timestamps**: Accurate transaction timing
- **Visual Indicators**: Color-coded transaction types

## Styling

The application uses CSS modules with a consistent design system based on CSS custom properties. The styling follows the existing StartPage patterns and supports both light and dark themes.

## Development

- Built with Next.js 15 and React 19
- TypeScript for type safety
- CSS Modules for component styling
- Responsive design with mobile-first approach

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).
