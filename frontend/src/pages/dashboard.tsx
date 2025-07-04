import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import InventoryDisplay from '../components/InventoryDisplay';
import EventLog from '../components/EventLog';
import FinancialsWidget from '../components/FinancialsWidget';

interface Inventory {
  product_name: string;
  price: number;
  quantity_in_stock: number;
}

interface LogEntry {
  id: number;
  timestamp: string;
  event_type: string;
  payload: any;
  ai_response: any;
}

export default function Dashboard() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      const [{ data: invData }, { data: logData }] = await Promise.all([
        supabase.from('inventory').select('*'),
        supabase
          .from('event_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(20),
      ]);

      setInventory(invData || []);
      setLogs(logData || []);

      // Example: compute balance from logs with ai_response.cash_balance or similar
      // For now, leave as 0.

      setLoading(false);
    };

    fetchInitial();

    const invChannel = supabase
      .channel('inventory-listen')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => {
          // Refresh inventory on any change
          supabase.from('inventory').select('*').then(({ data }) => {
            setInventory(data || []);
          });
        },
      )
      .subscribe();

    const logChannel = supabase
      .channel('logs-listen')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'event_logs' },
        (payload) => {
          setLogs((prev) => [payload.new as LogEntry, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(invChannel);
      supabase.removeChannel(logChannel);
    };
  }, []);

  if (loading) return <div>Loading simulation...</div>;

  return (
    <main className="flex min-h-screen flex-col gap-8 p-8 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold">Vending Machine Live Simulation</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        <div className="md:col-span-2">
          <h2 className="text-2xl mb-4">Live Inventory</h2>
          <InventoryDisplay inventory={inventory} />
        </div>
        <FinancialsWidget balance={balance} />
      </div>

      <div>
        <h2 className="text-2xl mb-4">Event Log</h2>
        <EventLog logs={logs} />
      </div>
    </main>
  );
} 