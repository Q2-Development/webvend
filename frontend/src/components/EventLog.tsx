import React from 'react';

interface LogEntry {
  id: number;
  timestamp: string;
  event_type: string;
  payload: any;
}

interface Props {
  logs: LogEntry[];
}

export default function EventLog({ logs }: Props) {
  if (logs.length === 0) {
    return <div>No events yet</div>;
  }

  return (
    <div className="h-96 overflow-y-auto bg-gray-800 p-4 rounded">
      {logs.map((log) => (
        <div
          key={log.id}
          className="mb-2 border-b border-gray-700 pb-1 text-gray-200"
        >
          <p className="text-xs text-gray-400">
            {new Date(log.timestamp).toLocaleTimeString()}
          </p>
          <p className="font-mono text-sm">{log.event_type}</p>
        </div>
      ))}
    </div>
  );
} 