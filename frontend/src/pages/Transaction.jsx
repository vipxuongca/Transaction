import React, { useState, useEffect } from "react";
import { transactionApi } from "../../api/api";
import Swal from "sweetalert2";

const TransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("income"); // "income" or "expense"

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const res = await transactionApi.getAllTransactions();
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch transactions", "error");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Add new transaction
  const addTransaction = async () => {
    if (!amount || !description) return;
    try {
      await transactionApi.createTransaction({
        amount: parseFloat(amount),
        description,
        type,
      });
      setAmount("");
      setDescription("");
      fetchTransactions();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to add transaction", "error");
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    try {
      await transactionApi.deleteTransaction(id);
      fetchTransactions();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete transaction", "error");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      <div className="mb-6 p-4 border rounded">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 mr-2"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 mr-2"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button
          onClick={addTransaction}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <div>
        {transactions.length === 0 && <p>No transactions yet.</p>}
        {transactions.map((t) => (
          <div
            key={t.id}
            className="flex justify-between items-center border-b py-2"
          >
            <div>
              <span className="font-semibold">{t.type}: </span>
              {t.description} - ${t.amount}
            </div>
            <button
              onClick={() => deleteTransaction(t.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionPage;
