import React from 'react';

interface InventoryItem {
  product_name: string;
  price: number;
  quantity_in_stock: number;
}

interface Props {
  inventory: InventoryItem[];
}

export default function InventoryDisplay({ inventory }: Props) {
  if (inventory.length === 0) {
    return <div>No inventory data</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {inventory.map((item) => (
        <div
          key={item.product_name}
          className="border p-4 rounded shadow-sm flex flex-col"
        >
          <span className="font-bold">{item.product_name}</span>
          <span>
            {item.price !== undefined && item.price !== null
              ? `$${Number(item.price || 0).toFixed(2)}`
              : 'Price N/A'}
          </span>
          <span>Qty: {item.quantity_in_stock}</span>
        </div>
      ))}
    </div>
  );
} 