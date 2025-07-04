import React from 'react';
import styles from '../styles/FinancialsWidget.module.css';

interface FinancialData {
  balance: number;
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number;
}

interface Props {
  financialData: FinancialData;
}

export default function FinancialsWidget({ financialData }: Props) {
  const formatCurrency = (value: number) => `$${(value || 0).toFixed(2)}`;
  const formatPercentage = (value: number) => `${(value || 0).toFixed(1)}%`;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <div className={styles.indicator}></div>
        Financial Overview
      </h2>
      
      <div className={styles.mainBalance}>
        <div className={styles.balanceLabel}>Current Balance</div>
        <div className={styles.balanceValue}>{formatCurrency(financialData.balance)}</div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Revenue</div>
          <div className={`${styles.metricValue} ${styles.positive}`}>
            {formatCurrency(financialData.revenue)}
          </div>
        </div>
        
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Expenses</div>
          <div className={`${styles.metricValue} ${styles.negative}`}>
            {formatCurrency(financialData.expenses)}
          </div>
        </div>
        
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Net Profit</div>
          <div className={`${styles.metricValue} ${financialData.profit >= 0 ? styles.positive : styles.negative}`}>
            {formatCurrency(financialData.profit)}
          </div>
        </div>
        
        <div className={styles.metric}>
          <div className={styles.metricLabel}>Profit Margin</div>
          <div className={`${styles.metricValue} ${financialData.profitMargin >= 0 ? styles.positive : styles.negative}`}>
            {formatPercentage(financialData.profitMargin)}
          </div>
        </div>
      </div>
    </div>
  );
} 