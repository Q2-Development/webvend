import React, { useState, useEffect, useCallback } from 'react';
import styles from './SimulationDashboard.module.css';
import { RealTimeUpdates } from './RealTimeUpdates';

interface InventoryItem {
  product_name: string;
  vendor_cost: number;
  retail_price: number;
  quantity_in_stock: number;
}

interface Model {
  id: string;
  name: string;
  description?: string;
}

interface CashBalance {
  account_name: string;
  balance: number;
}

interface Transaction {
  id: number;
  product: string;
  price: number;
  action: 'sold_to_customer' | 'bought_from_vendor';
  created_at: string;
}

export const SimulationDashboard = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [cashBalance, setCashBalance] = useState<CashBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchInventory = useCallback(async () => {
    try {
      const response = await fetch('/api/vending/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      const data = await response.json();
      setInventory(data.inventory || []);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Failed to load inventory');
      console.error('Error fetching inventory:', err);
    }
  }, []);

  const fetchModels = useCallback(async () => {
    try {
      const response = await fetch('/api/models');
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      setModels(data.data || []);
      if (data.data && data.data.length > 0 && !selectedModel) {
        setSelectedModel(data.data[0].id);
      }
    } catch (err) {
      setError('Failed to load AI models');
      console.error('Error fetching models:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedModel]);

  const fetchCashBalance = useCallback(async () => {
    try {
      const response = await fetch('/api/vending/balance');
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      const data = await response.json();
      setCashBalance(data.balance || null);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('/api/vending/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchModels();
    fetchCashBalance();
    fetchTransactions();
  }, [fetchInventory, fetchModels, fetchCashBalance, fetchTransactions]);

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    console.log('Switching to model:', modelId);
  };

  const handleStartSimulation = () => {
    setSimulationActive(true);
    console.log('Starting simulation with model:', selectedModel);
  };

  const handlePauseSimulation = () => {
    setSimulationActive(false);
    console.log('Pausing simulation');
  };

  const handleResetSimulation = () => {
    setSimulationActive(false);
    setInventory([]);
    setError(null);
    fetchInventory();
    fetchCashBalance();
    fetchTransactions();
    console.log('Resetting simulation');
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchInventory(), 
      fetchModels(), 
      fetchCashBalance(), 
      fetchTransactions()
    ]);
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
    if (transaction.action === 'sold_to_customer') {
      return `Sold ${transaction.product} for $${transaction.price.toFixed(2)}`;
    } else {
      return `Bought ${transaction.product} for $${transaction.price.toFixed(2)}`;
    }
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

  return (
    <div className={styles.dashboard}>
      <RealTimeUpdates
        onInventoryUpdate={fetchInventory}
        onModelsUpdate={fetchModels}
        onBalanceUpdate={fetchCashBalance}
        onTransactionsUpdate={fetchTransactions}
        isActive={simulationActive}
      />
      
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
            <h2 className={styles.sectionTitle}>AI Model Selection</h2>
            <div className={styles.modelSelector}>
              <select 
                value={selectedModel} 
                onChange={(e) => handleModelChange(e.target.value)}
                className={styles.modelSelect}
                disabled={simulationActive}
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            {simulationActive && (
              <p className={styles.warningText}>
                Model cannot be changed while simulation is active
              </p>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Financial Status</h2>
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

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Agent Status</h2>
            <div className={styles.statusCard}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Current Model:</span>
                <span className={styles.statusValue}>
                  {models.find(m => m.id === selectedModel)?.name || 'Unknown'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Total Items:</span>
                <span className={styles.statusValue}>
                  {inventory.reduce((sum, item) => sum + item.quantity_in_stock, 0)}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Unique Products:</span>
                <span className={styles.statusValue}>{inventory.length}</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Simulation Status:</span>
                <span className={`${styles.statusValue} ${simulationActive ? styles.activeText : styles.inactiveText}`}>
                  {simulationActive ? 'Running' : 'Stopped'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Simulation Controls</h2>
            <div className={styles.controls}>
              <button 
                className={`${styles.controlButton} ${simulationActive ? styles.disabled : ''}`}
                onClick={handleStartSimulation}
                disabled={simulationActive}
              >
                Start Simulation
              </button>
              <button 
                className={`${styles.controlButton} ${!simulationActive ? styles.disabled : ''}`}
                onClick={handlePauseSimulation}
                disabled={!simulationActive}
              >
                Pause Simulation
              </button>
              <button 
                className={styles.controlButton}
                onClick={handleResetSimulation}
              >
                Reset Simulation
              </button>
            </div>
          </div>
        </div>

        <div className={styles.mainArea}>
          <div className={styles.inventorySection}>
            <h2 className={styles.sectionTitle}>Current Inventory</h2>
            <div className={styles.inventoryGrid}>
              {inventory.length > 0 ? (
                inventory.map((item) => (
                  <div key={item.product_name} className={styles.inventoryCard}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemName}>{item.product_name}</h3>
                      <div className={styles.priceInfo}>
                        <span className={styles.retailPrice}>${item.retail_price?.toFixed(2) || '0.00'}</span>
                        <span className={styles.vendorCost}>Cost: ${item.vendor_cost?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.stockLevel}>
                        In Stock: {item.quantity_in_stock}
                      </span>
                      <span className={styles.marginInfo}>
                        Margin: ${((item.retail_price - item.vendor_cost) * item.quantity_in_stock).toFixed(2)}
                      </span>
                    </div>
                    <div className={styles.stockIndicator}>
                      <div 
                        className={`${styles.stockBar} ${
                          item.quantity_in_stock > 10 ? styles.highStock :
                          item.quantity_in_stock > 5 ? styles.mediumStock :
                          styles.lowStock
                        }`}
                        style={{ width: `${Math.min((item.quantity_in_stock / 30) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>No inventory items available</p>
                  <p className={styles.emptySubtext}>
                    The AI agent may need to restock the vending machine.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.activitySection}>
            <h2 className={styles.sectionTitle}>Recent Transactions</h2>
            <div className={styles.activityLog}>
              {transactions.length > 0 ? (
                transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className={styles.activityItem}>
                    <span className={styles.activityTime}>
                      {formatTransactionTime(transaction.created_at)}
                    </span>
                    <span className={styles.activityText}>
                      {getTransactionDescription(transaction)}
                    </span>
                    <span className={`${styles.transactionType} ${
                      transaction.action === 'sold_to_customer' ? styles.sale : styles.purchase
                    }`}>
                      {transaction.action === 'sold_to_customer' ? 'SALE' : 'PURCHASE'}
                    </span>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>No transactions recorded yet</p>
                  <p className={styles.emptySubtext}>
                    Transactions will appear here as the AI agent makes decisions.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};