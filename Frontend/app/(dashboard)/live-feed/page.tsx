"use client"

import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

type LiveTx = {
  amount: number
  receiver: string
  risk: number
}

export default function LiveFeed() {
  const [transactions, setTransactions] = useState<LiveTx[]>([]);

  useEffect(() => {
    socket.on("new-transaction", (data: any) => {
      const { tx, result } = data;
      const formattedTx: LiveTx = {
        amount: tx.amount,
        receiver: tx.receiverId,
        risk: result.fraudScore,
      };
      setTransactions((prev) => [formattedTx, ...prev]);
    });
    
    return () => {
      socket.off("new-transaction");
    };
  }, []);

  return (
    <div>
      {transactions.map((tx, i) => (
        <div key={i} className={`bubble ${getColor(tx.risk)}`}>
          ₹{tx.amount} → {tx.receiver}
          <br />
          Risk: {tx.risk}
        </div>
      ))}
    </div>
  );
}

const getColor = (risk: number) => {
  if (risk > 70) return "red";
  if (risk > 40) return "yellow";
  return "green";
};