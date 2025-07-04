import React from 'react';
import styles from '../styles/PerformanceMetrics.module.css';

interface PerformanceData {
  totalSales: number;
  averageTransactionValue: number;
  topSellingProduct: string;
  inventoryTurnover: number;
  customerSatisfaction: number;
}

interface Props {
  performanceData: PerformanceData;
}

export default function PerformanceMetrics({ performanceData }: Props) {
  const formatCurrency = (value: number) => `$${(value || 0).toFixed(2)}`;
  const formatPercentage = (value: number) => `${((value || 0) * 100).toFixed(1)}%`;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <div className={styles.indicator}></div>
        Performance Metrics
      </h2>
      
      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <div className={styles.metricValue}>{performanceData.totalSales}</div>
          <div className={styles.metricLabel}>Total Sales</div>
        </div>
        
        <div className={styles.metric}>
          <div className={styles.metricValue}>{formatCurrency(performanceData.averageTransactionValue)}</div>
          <div className={styles.metricLabel}>Avg Transaction</div>
        </div>
        
        <div className={styles.metric}>
          <div className={styles.metricValue}>{(performanceData.inventoryTurnover || 0).toFixed(1)}</div>
          <div className={styles.metricLabel}>Inventory Turnover</div>
        </div>
        
        <div className={styles.metric}>
          <div className={styles.metricValue}>{formatPercentage(performanceData.customerSatisfaction)}</div>
          <div className={styles.metricLabel}>Customer Satisfaction</div>
        </div>
      </div>
      
      {performanceData.topSellingProduct && (
        <div className={styles.topProduct}>
          <div className={styles.topProductLabel}>Top Selling Product</div>
          <div className={styles.topProductName}>{performanceData.topSellingProduct}</div>
        </div>
      )}
    </div>
  );
} 