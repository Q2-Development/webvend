import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { SimulationDashboard } from "src/components/simulation-dashboard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Project Web-Vend - Simulation Dashboard</title>
        <meta name="description" content="AI vending machine simulation dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <SimulationDashboard />
      </main>
    </>
  );
} 