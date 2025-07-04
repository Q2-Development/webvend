import React from 'react';
import styles from '../styles/CustomerInsights.module.css';

interface LogEntry {
  id: number;
  timestamp: string;
  event_type: string;
  payload: any;
  ai_response: any;
}

interface Props {
  logs: LogEntry[];
}

export default function CustomerInsights({ logs }: Props) {
  const customerEvents = logs.filter(log => 
    log.event_type.includes('purchase') || log.event_type.includes('customer')
  );

  const recentActivity = customerEvents.slice(0, 5);
  
  const demandPatterns = logs.reduce((acc: Record<string, number>, log) => {
    if (log.event_type === 'human.purchase.requested' && log.payload?.item_name) {
      acc[log.payload.item_name] = (acc[log.payload.item_name] || 0) + 1;
    }
    return acc;
  }, {});

  const topDemandedItems = Object.entries(demandPatterns)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <div className={styles.indicator}></div>
        Customer Insights
      </h2>
      
      <div className={styles.content}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Activity</h3>
          <div className={styles.activityList}>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityTime}>
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                  <div className={styles.activityEvent}>
                    {activity.event_type.replace(/\./g, ' ')}
                  </div>
                  {activity.payload?.item_name && (
                    <div className={styles.activityDetail}>
                      Item: {activity.payload.item_name}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.noActivity}>No customer activity yet</div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Demand Patterns</h3>
          <div className={styles.demandList}>
            {topDemandedItems.length > 0 ? (
              topDemandedItems.map(([item, count]) => (
                <div key={item} className={styles.demandItem}>
                  <div className={styles.demandItemName}>{item}</div>
                  <div className={styles.demandCount}>{count} requests</div>
                </div>
              ))
            ) : (
              <div className={styles.noDemand}>No demand data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 