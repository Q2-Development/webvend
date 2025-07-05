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

  const getActionIcon = (action: any) => {
    if (!action || !action.action) return '🤔';
    switch(action.action) {
      case 'BUY':
        return '🛒';
      case 'UPDATE_PRICE':
        return '💰';
      case 'DO_NOTHING':
        return '⏸️';
      default:
        return '❓';
    }
  };

  const getActionColor = (action: any) => {
    if (!action || !action.action) return 'neutral';
    switch(action.action) {
      case 'BUY':
        return 'success';
      case 'UPDATE_PRICE':
        return 'warning';
      case 'DO_NOTHING':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const formatAction = (action: any) => {
    if (!action || !action.action) return 'No action taken.';
    switch(action.action) {
      case 'BUY':
        return `Buy ${action.quantity} units of ${action.item_name}`;
      case 'UPDATE_PRICE':
        return `Update ${action.item_name} price to $${action.price.toFixed(2)}`;
      case 'DO_NOTHING':
        return 'Wait and observe market conditions';
      default:
        return 'Unknown action';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStepStatus = (stepNumber: number) => {
    const isLatest = stepNumber === Math.max(...logs.map(log => log.step_number));
    return isLatest ? 'latest' : 'completed';
  };

  return (
    <div className={styles.section}>
      <div className={styles.aiLogsHeader}>
        <h2 className={styles.sectionTitle}>
          🧠 AI Decision Process
        </h2>
        <div className={styles.aiLogsStatus}>
          <div className={`${styles.statusDot} ${isActive ? styles.active : styles.inactive}`}></div>
          <span className={styles.statusText}>
            {isActive ? 'Live Updates' : 'Paused'}
          </span>
        </div>
      </div>
      
      <div className={styles.aiLogsContainer} ref={logContainerRef}>
        {logs.length > 0 ? (
          <div className={styles.aiLogsTimeline}>
            {logs.map((log, index) => (
              <div key={log.id} className={`${styles.aiLogEntry} ${styles[getStepStatus(log.step_number)]}`}>
                <div className={styles.aiLogTimeline}>
                  <div className={styles.aiLogStep}>
                    <span className={styles.stepNumber}>{log.step_number}</span>
                  </div>
                  {index < logs.length - 1 && <div className={styles.timelineConnector}></div>}
                </div>
                
                <div className={styles.aiLogContent}>
                  <div className={styles.aiLogHeader}>
                    <div className={styles.aiLogTime}>
                      {formatTime(log.created_at)}
                    </div>
                    <div className={styles.aiLogAgent}>
                      🤖 {log.agent_name}
                    </div>
                  </div>
                  
                  <div className={`${styles.aiLogDecision} ${styles[getActionColor(log.parsed_action)]}`}>
                    <div className={styles.decisionIcon}>
                      {getActionIcon(log.parsed_action)}
                    </div>
                    <div className={styles.decisionText}>
                      <strong>Decision:</strong> {formatAction(log.parsed_action)}
                    </div>
                  </div>
                  
                  <details className={styles.aiLogDetails}>
                    <summary className={styles.aiLogSummary}>
                      <span>🔍 View AI Reasoning</span>
                      <span className={styles.expandIcon}>▼</span>
                    </summary>
                    <div className={styles.aiLogReasoning}>
                      <div className={styles.reasoningSection}>
                        <h4>💭 Prompt Given to AI</h4>
                        <pre className={styles.promptText}>{log.prompt}</pre>
                      </div>
                      <div className={styles.reasoningSection}>
                        <h4>🎯 AI's Response</h4>
                        <pre className={styles.responseText}>{log.response}</pre>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.aiLogsEmpty}>
            <div className={styles.emptyIcon}>🤖</div>
            <p>Waiting for AI to start making decisions...</p>
            <small>Start a simulation to see the AI's thought process</small>
          </div>
        )}
      </div>
    </div>
  );
}; 