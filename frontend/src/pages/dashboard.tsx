import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import InventoryDisplay from '../components/InventoryDisplay';
import EventLog from '../components/EventLog';
import FinancialsWidget from '../components/FinancialsWidget';
import AIModelSelector from '../components/AIModelSelector';
import PerformanceMetrics from '../components/PerformanceMetrics';
import CustomerInsights from '../components/CustomerInsights';
import PricingStrategy from '../components/PricingStrategy';
import styles from '../styles/dashboard.module.css';

interface Inventory {
  product_name: string;
  price: number;
  quantity_in_stock: number;
  cost_per_unit?: number;
  reorder_threshold?: number;
}

interface LogEntry {
  id: number;
  timestamp: string;
  event_type: string;
  payload: any;
  ai_response: any;
}

interface FinancialData {
  balance: number;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
}

interface PerformanceData {
  totalSales: number;
  averageTransactionValue: number;
  topSellingProduct: string;
  inventoryTurnover: number;
  customerSatisfaction: number;
}

export default function Dashboard() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('claude-3-5-sonnet');
  const [financialData, setFinancialData] = useState<FinancialData>({
    balance: 1000,
    revenue: 0,
    expenses: 0,
    profit: 0,
    profitMargin: 0
  });
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    totalSales: 0,
    averageTransactionValue: 0,
    topSellingProduct: '',
    inventoryTurnover: 0,
    customerSatisfaction: 0
  });
  const [loading, setLoading] = useState(true);
  const [simulationRunning, setSimulationRunning] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      const [{ data: invData }, { data: logData }] = await Promise.all([
        supabase.from('inventory').select('*'),
        supabase
          .from('event_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50),
      ]);

      setInventory(invData || []);
      setLogs(logData || []);

      // Calculate financial data from logs
      if (logData) {
        calculateFinancialData(logData);
        calculatePerformanceData(logData, invData || []);
      }

      setLoading(false);
    };

    fetchInitial();

    const invChannel = supabase
      .channel('inventory-listen')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload) => {
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
          const newLog = payload.new as LogEntry;
          setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
          
          // Update financial and performance data when new events come in
          setLogs((currentLogs) => {
            calculateFinancialData([newLog, ...currentLogs]);
            calculatePerformanceData([newLog, ...currentLogs], inventory);
            return [newLog, ...currentLogs.slice(0, 49)];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(invChannel);
      supabase.removeChannel(logChannel);
    };
  }, [inventory]);

  const calculateFinancialData = (logs: LogEntry[]) => {
    let revenue = 0;
    let expenses = 0;
    let balance = 1000; // Starting balance

    logs.forEach(log => {
      if (log.event_type === 'human.purchase.completed' && log.ai_response?.transaction) {
        revenue += log.ai_response.transaction.amount || 0;
        balance += log.ai_response.transaction.amount || 0;
      }
      if (log.event_type === 'ai.inventory.restocked' && log.ai_response?.cost) {
        expenses += log.ai_response.cost || 0;
        balance -= log.ai_response.cost || 0;
      }
    });

    const profit = revenue - expenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    setFinancialData({ balance, revenue, expenses, profit, profitMargin });
  };

  const calculatePerformanceData = (logs: LogEntry[], inventory: Inventory[]) => {
    const salesEvents = logs.filter(log => log.event_type === 'human.purchase.completed');
    const totalSales = salesEvents.length;
    const totalRevenue = salesEvents.reduce((sum, log) => sum + (log.ai_response?.transaction?.amount || 0), 0);
    const averageTransactionValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    // Find top selling product
    const productSales: Record<string, number> = {};
    salesEvents.forEach(log => {
      const product = log.payload?.item_name;
      if (product) {
        productSales[product] = (productSales[product] || 0) + 1;
      }
    });
    
    const topSellingProduct = Object.keys(productSales).reduce((a, b) => 
      productSales[a] > productSales[b] ? a : b, ''
    );

    // Mock inventory turnover and customer satisfaction for now
    const inventoryTurnover = inventory.length > 0 ? totalSales / inventory.length : 0;
    const customerSatisfaction = Math.random() * 0.3 + 0.7; // 70-100% range

    setPerformanceData({
      totalSales,
      averageTransactionValue,
      topSellingProduct,
      inventoryTurnover,
      customerSatisfaction
    });
  };

  const handleStartSimulation = () => {
    setSimulationRunning(true);
    // TODO: Trigger simulation start via API
  };

  const handleStopSimulation = () => {
    setSimulationRunning(false);
    // TODO: Trigger simulation stop via API
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    // TODO: Switch AI model and reset simulation state
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading Vendius AI Simulation...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Project Web-Vend
              </h1>
              <p className="text-gray-400 mt-1">Autonomous AI Strategy Simulation</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${simulationRunning ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm text-gray-300">
                  {simulationRunning ? 'Simulation Running' : 'Simulation Stopped'}
                </span>
              </div>
              <button
                onClick={simulationRunning ? handleStopSimulation : handleStartSimulation}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  simulationRunning 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {simulationRunning ? 'Stop' : 'Start'} Simulation
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* AI Model Selector */}
        <div className="mb-8">
          <AIModelSelector 
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Financial Overview */}
          <div className="lg:col-span-1">
            <FinancialsWidget financialData={financialData} />
          </div>

          {/* Performance Metrics */}
          <div className="lg:col-span-1">
            <PerformanceMetrics performanceData={performanceData} />
          </div>

          {/* Customer Insights */}
          <div className="lg:col-span-2">
            <CustomerInsights logs={logs} />
          </div>
        </div>

        {/* Inventory and Strategy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Live Inventory */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Live Inventory
              </h2>
              <InventoryDisplay inventory={inventory} />
            </div>
          </div>

          {/* Pricing Strategy */}
          <div className="lg:col-span-1">
            <PricingStrategy inventory={inventory} logs={logs} />
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            AI Decision Log
          </h2>
          <EventLog logs={logs} />
        </div>
      </div>
    </main>
  );
} 