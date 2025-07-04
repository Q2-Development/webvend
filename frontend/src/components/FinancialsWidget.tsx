import React from 'react';

interface Props {
  balance: number;
}

export default function FinancialsWidget({ balance }: Props) {
  return (
    <div className="border p-4 rounded shadow-sm">
      <h2 className="text-xl mb-2">Cash Balance</h2>
      <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
    </div>
  );
} 