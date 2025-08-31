import { useState } from "react";
import TransactionsList from "./components/Transactions/TransactionsList.jsx";

const initial = [
  {
    id: 1,
    transactionDate: "2025-08-25",
    type: "INCOME",
    categoryName: "Salary",
    comment: "August",
    amount: 25000,
  },
  {
    id: 2,
    transactionDate: "2025-08-26",
    type: "EXPENSE",
    categoryName: "Groceries",
    comment: "",
    amount: 980,
  },
];

export default function App() {
  const [items, setItems] = useState(initial);

  const handleAdd = () => {
    // sadece demo
    const id = Math.random().toString(36).slice(2, 8);
    setItems((prev) => [
      {
        id,
        transactionDate: new Date().toISOString(),
        type: "EXPENSE",
        categoryName: "New",
        comment: "demo",
        amount: 123,
      },
      ...prev,
    ]);
  };

  const handleEdit = (it) => {
    // demo: comment'e " (edited)" ekleyelim
    setItems((prev) =>
      prev.map((x) =>
        x.id === it.id ? { ...x, comment: (x.comment || "") + " (edited)" } : x
      )
    );
  };

  const handleDelete = (id) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <div style={{ margin: "16px" }}>
      <TransactionsList
        transactions={items}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
