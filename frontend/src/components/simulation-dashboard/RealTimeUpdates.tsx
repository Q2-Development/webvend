import React, { useState, useEffect, useRef } from 'react';
import styles from './SimulationDashboard.module.css';

interface SimulationLog {
  id: number;
  step_number: number;
  agent_name: string;
  prompt: string;
  response: string;
  parsed_action: any;
  created_at: string;
}

interface RealTimeUpdatesProps {
  simulationId: string | null;
  isActive: boolean;
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({ simulationId, isActive }) => {
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!simulationId) return;
      try {
        const response = await fetch(`${backendUrl}/api/simulation/logs/${simulationId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }
        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch simulation logs:", error);
      }
    };

    fetchLogs(); // Initial fetch

    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(fetchLogs, 5000); // Poll every 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [simulationId, isActive]);
  
  useEffect(() => {
    // Scroll to the bottom of the log container when new logs are added
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);


  const formatAction = (action: any) => {
    if (!action || !action.action) return 'No action taken.';
    switch(action.action) {
      case 'BUY':
        return `Decided to BUY ${action.quantity} of ${action.item_name}.`;
      case 'UPDATE_PRICE':
        return `Decided to UPDATE price of ${action.item_name} to $${action.price.toFixed(2)}.`;
      case 'DO_NOTHING':
        return 'Decided to do nothing and observe sales.';
      default:
        return 'Unknown action.';
    }
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>AI Thought Process (Live)</h2>
      <div className={`${styles.logsContainer} ${styles.card}`} ref={logContainerRef}>
        {logs.length > 0 ? (
          logs.map(log => (
            <div key={log.id} className={styles.logEntry}>
              <div className={styles.logHeader}>
                <strong>Step {log.step_number}</strong> - <span>{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
              <div className={styles.logContent}>
                <p><strong>Decision:</strong> {formatAction(log.parsed_action)}</p>
                <details>
                  <summary>View AI's reasoning</summary>
                  <pre className={styles.promptResponse}>
                    <strong>--- PROMPT ---</strong><br/>
                    {log.prompt}
                    <br/><br/>
                    <strong>--- RESPONSE ---</strong><br/>
                    {log.response}
                  </pre>
                </details>
              </div>
            </div>
          ))
        ) : (
          <p>Waiting for simulation to start...</p>
        )}
      </div>
    </div>
  );
}; 