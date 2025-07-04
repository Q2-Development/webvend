import React from 'react';
import styles from '../styles/PricingStrategy.module.css';

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

interface Props {
  inventory: Inventory[];
  logs: LogEntry[];
}

export default function PricingStrategy({ inventory, logs }: Props) {
  const pricingEvents = logs.filter(log => 
    log.event_type.includes('price') || log.event_type.includes('pricing')
  );

  const calculateMargin = (price: number, cost?: number) => {
    if (!cost || cost === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  const getMarginStatus = (margin: number) => {
    if (margin >= 50) return 'high';
    if (margin >= 25) return 'medium';
    return 'low';
  };

  const recentPriceChanges = pricingEvents
    .slice(0, 3)
    .map(event => ({
      timestamp: event.timestamp,
      product: event.payload?.product_name || 'Unknown',
      oldPrice: event.payload?.old_price || 0,
      newPrice: event.payload?.new_price || 0,
      reason: event.ai_response?.reasoning || 'No reason provided'
    }));

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <div className={styles.indicator}></div>
        Pricing Strategy
      </h2>
      
      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Price Margins</h3>
          <div className={styles.marginsList}>
            {inventory.length > 0 ? (
              inventory.map((item) => {
                const margin = calculateMargin(item.price, item.cost_per_unit);
                const status = getMarginStatus(margin);
                
                return (
                  <div key={item.product_name} className={styles.marginItem}>
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>{item.product_name}</div>
                      <div className={styles.productPrice}>${(item.price || 0).toFixed(2)}</div>
                    </div>
                    <div className={`${styles.margin} ${styles[`margin${status.charAt(0).toUpperCase() + status.slice(1)}`]}`}>
                      {(margin || 0).toFixed(1)}%
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.noData}>No inventory data available</div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Price Changes</h3>
          <div className={styles.changesList}>
            {recentPriceChanges.length > 0 ? (
              recentPriceChanges.map((change, index) => (
                <div key={index} className={styles.changeItem}>
                  <div className={styles.changeHeader}>
                    <div className={styles.changeProduct}>{change.product}</div>
                    <div className={styles.changeTime}>
                      {new Date(change.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className={styles.changePrices}>
                    <span className={styles.oldPrice}>${(change.oldPrice || 0).toFixed(2)}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.newPrice}>${(change.newPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className={styles.changeReason}>
                    {change.reason}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noData}>No recent price changes</div>
            )}
          </div>
        </div>

        <div className={styles.strategyInsights}>
          <h3 className={styles.sectionTitle}>AI Strategy Insights</h3>
          <div className={styles.insights}>
            <div className={styles.insight}>
              <div className={styles.insightLabel}>Pricing Approach</div>
              <div className={styles.insightValue}>
                {inventory.length > 0 
                  ? inventory.some(item => calculateMargin(item.price, item.cost_per_unit) > 40)
                    ? 'Premium Pricing'
                    : 'Competitive Pricing'
                  : 'Not Set'
                }
              </div>
            </div>
            <div className={styles.insight}>
              <div className={styles.insightLabel}>Avg Margin</div>
              <div className={styles.insightValue}>
                {inventory.length > 0 
                  ? `${(inventory.reduce((sum, item) => sum + calculateMargin(item.price || 0, item.cost_per_unit), 0) / inventory.length).toFixed(1)}%`
                  : '0%'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 