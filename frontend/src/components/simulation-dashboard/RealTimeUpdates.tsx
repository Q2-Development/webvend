import React, { useEffect, useRef } from 'react';

interface RealTimeUpdatesProps {
  onInventoryUpdate: () => void;
  onModelsUpdate: () => void;
  onBalanceUpdate: () => void;
  onTransactionsUpdate: () => void;
  isActive: boolean;
}

export const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({
  onInventoryUpdate,
  onModelsUpdate,
  onBalanceUpdate,
  onTransactionsUpdate,
  isActive
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      // Update inventory every 30 seconds
      intervalRef.current = setInterval(() => {
        onInventoryUpdate();
      }, 30000);

      // Update balance every 15 seconds (more frequent for financial data)
      const balanceInterval = setInterval(() => {
        onBalanceUpdate();
      }, 15000);

      // Update transactions every 20 seconds
      const transactionsInterval = setInterval(() => {
        onTransactionsUpdate();
      }, 20000);

      // Update models every 5 minutes (less frequent)
      const modelsInterval = setInterval(() => {
        onModelsUpdate();
      }, 300000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        clearInterval(balanceInterval);
        clearInterval(transactionsInterval);
        clearInterval(modelsInterval);
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isActive, onInventoryUpdate, onModelsUpdate, onBalanceUpdate, onTransactionsUpdate]);

  return null; // This component doesn't render anything
}; 