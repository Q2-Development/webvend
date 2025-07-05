import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './SimulationDashboard.module.css';
import { RealTimeUpdates } from './RealTimeUpdates';

interface InventoryItem {
  product_name: string;
  vendor_cost: number;
  retail_price: number;
  quantity_in_stock: number;
}

interface CashBalance {
  balance: number;
}

interface Transaction {
  id: number;
  product: string;
  price: number;
  action: 'sold_to_customer' | 'bought_from_vendor' | 'price_change';
  agent_name?: string;
  created_at: string;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const SimulationDashboard = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [stepNumber, setStepNumber] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [cashBalance, setCashBalance] = useState<CashBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [inventoryRes, balanceRes, transactionsRes] = await Promise.all([
        fetch(`${backendUrl}/api/vending/inventory`),
        fetch(`${backendUrl}/api/vending/balance`),
        fetch(`${backendUrl}/api/vending/transactions`),
      ]);

      if (!inventoryRes.ok || !balanceRes.ok || !transactionsRes.ok) {
        throw new Error('Failed to fetch simulation data');
      }

      const inventoryData = await inventoryRes.json();
      const balanceData = await balanceRes.json();
      const transactionsData = await transactionsRes.json();

      setInventory(inventoryData.inventory || []);
      setCashBalance(balanceData);
      setTransactions(transactionsData.transactions || []);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load simulation data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const runSimulationStep = useCallback(async () => {
    if (!simulationId) return;

    try {
      const response = await fetch(`${backendUrl}/api/simulation/step?simulation_id=${simulationId}&step_number=${stepNumber}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to run simulation step');
      }
      setStepNumber(prev => prev + 1);
      // After a step, refresh data to show updates
      await fetchAllData();
    } catch (err) {
      console.error('Error running simulation step:', err);
      setError('Failed to run simulation step. Pausing simulation.');
      setSimulationActive(false);
    }
  }, [simulationId, stepNumber, fetchAllData]);
  
  useEffect(() => {
    if (simulationActive && simulationId) {
      stepIntervalRef.current = setInterval(runSimulationStep, 3000); // Run every 3 seconds
    } else {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
    }
    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
    };
  }, [simulationActive, simulationId, runSimulationStep]);


  const handleStartSimulation = async () => {
    try {
        const response = await fetch(`${backendUrl}/api/simulation/start`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to start simulation');
        const data = await response.json();
        setSimulationId(data.simulation_id);
        setStepNumber(1);
        setSimulationActive(true);
        console.log('Starting simulation with ID:', data.simulation_id);
    } catch (error) {
        console.error('Error starting simulation:', error);
        setError('Failed to start simulation.');
    }
  };

  const handlePauseSimulation = () => {
    setSimulationActive(false);
    console.log('Pausing simulation');
  };

  const handleResetSimulation = async () => {
    try {
        const response = await fetch(`${backendUrl}/api/simulation/reset`, { method: 'POST' });
        if (!response.ok) throw new Error('Failed to reset simulation');
        setSimulationActive(false);
        setSimulationId(null);
        setStepNumber(0);
        await fetchAllData();
        console.log('Resetting simulation');
    } catch (error) {
        console.error('Error resetting simulation:', error);
        setError('Failed to reset simulation.');
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const formatLastUpdate = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTransactionTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.agent_name === 'Customer') {
      return `Sold ${transaction.product} for $${transaction.price.toFixed(2)}`;
    } else if (transaction.agent_name === 'VendingMachine') {
        return `Bought ${transaction.product} for $${transaction.price.toFixed(2)}`;
    }
    return `Transaction: ${transaction.product} for $${transaction.price.toFixed(2)}`;
  };

  const calculateTotalValue = () => {
    return inventory.reduce((total, item) => {
      return total + (item.quantity_in_stock * item.retail_price);
    }, 0);
  };

  const calculateTotalCost = () => {
    return inventory.reduce((total, item) => {
      return total + (item.quantity_in_stock * item.vendor_cost);
    }, 0);
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading simulation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.errorContainer}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('Simulation Active: ', simulationActive);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>AI Vending Machine Simulation</h1>
          <p className={styles.subtitle}>Observing autonomous AI strategy in action</p>
          <div className={styles.statusIndicator}>
            <span className={`${styles.statusDot} ${simulationActive ? styles.active : styles.inactive}`}></span>
            <span className={styles.statusText}>
              {simulationActive ? 'Simulation Active' : 'Simulation Paused'}
            </span>
            <span className={styles.lastUpdate}>
              Last update: {formatLastUpdate(lastUpdate)}
            </span>
            <button 
              onClick={handleManualRefresh}
              disabled={refreshing}
              className={styles.refreshButton}
            >
              {refreshing ? 'Refreshing...' : '↻ Refresh'}
            </button>
          </div>
        </div>
        <nav className={styles.nav}>
          <a href="/" className={styles.navLink}>← Back to Overview</a>
        </nav>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Controls</h2>
            <div className={styles.controls}>
              <button 
                onClick={handleStartSimulation} 
                disabled={simulationActive}
                className={`${styles.controlButton} ${styles.startButton}`}
              >
                ▶ Start
              </button>
              <button 
                onClick={handlePauseSimulation} 
                disabled={!simulationActive}
                className={`${styles.controlButton} ${styles.pauseButton} ${!simulationActive ? styles.disabled : ''}`}
              >
                ❚❚ Pause
              </button>
              <button 
                onClick={handleResetSimulation}
                disabled={!simulationActive}
                className={`${styles.controlButton} ${styles.resetButton} ${!simulationActive ? styles.disabled : ''}`}
              >
                ■ Reset
              </button>
            </div>
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Financials</h2>
            <div className={styles.statusCard}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Cash Balance:</span>
                <span className={`${styles.statusValue} ${cashBalance?.balance && cashBalance.balance > 0 ? styles.positiveBalance : styles.negativeBalance}`}>
                  ${cashBalance?.balance?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Inventory Value:</span>
                <span className={styles.statusValue}>
                  ${calculateTotalValue().toFixed(2)}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Total Cost:</span>
                <span className={styles.statusValue}>
                  ${calculateTotalCost().toFixed(2)}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Gross Profit:</span>
                <span className={`${styles.statusValue} ${calculateTotalValue() - calculateTotalCost() > 0 ? styles.positiveBalance : styles.negativeBalance}`}>
                  ${(calculateTotalValue() - calculateTotalCost()).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.primaryContent}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Live Transaction Log</h2>
            <div className={`${styles.transactions} ${styles.card}`}>
              {transactions.length > 0 ? (
                <ul>
                  {transactions.map((t) => (
                    <li key={t.id} className={styles.transactionItem}>
                      <span className={styles.transactionTime}>{formatTransactionTime(t.created_at)}</span>
                      <span className={styles.transactionDesc}>{getTransactionDescription(t)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p>No transactions yet.</p>}
            </div>
          </div>
          
          <RealTimeUpdates
            simulationId={simulationId}
            isActive={simulationActive}
          />

        </div>
      </div>
    </div>
  );
};