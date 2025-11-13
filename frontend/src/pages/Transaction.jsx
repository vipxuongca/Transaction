import React, { useState, useEffect } from "react";
import { transactionApi } from "../../api/api";
import Swal from "sweetalert2";

const TransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("income"); // income | expense

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const res = await transactionApi.getAllTransactions();
      setTransactions(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch transactions", "error");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Add transaction
  const addTransaction = async () => {
    if (!amount) return;
    try {
      await transactionApi.createTransaction({
        amount_cents: Math.round(parseFloat(amount) * 100),
        currency,
        notes,
        type,
      });
      setAmount("");
      setNotes("");
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
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý chi tiêu</h1>

      <div className="mb-6 p-4 border rounded">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTransaction();
          }}
        >
          <input
            type="number"
            placeholder="Tổng tiền *"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 mr-2"
            required
          />
          <input
            type="text"
            placeholder="Ghi chú"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 mr-2"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 mr-2"
            required
          >
            <option value="income">Thu</option>
            <option value="expense">Chi</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Thêm giao dịch
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Loại giao dịch</th>
                <th className="py-2 px-4 border-b text-left">Ghi chú</th>
                <th className="py-2 px-4 border-b text-right">Tổng tiền</th>
                <th className="py-2 px-4 border-b text-left">Tiền Tệ</th>
                <th className="py-2 px-4 border-b text-left">Thời gian</th>
                <th className="py-2 px-4 border-b text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    {t.type === "income"
                      ? "Thu"
                      : t.type === "expense"
                      ? "Chi"
                      : t.type}
                  </td>

                  <td className="py-2 px-4 border-b">{t.notes || "—"}</td>
                  <td className="py-2 px-4 border-b text-right">
                    {(t.amount_cents / 100).toLocaleString()}
                  </td>

                  <td className="py-2 px-4 border-b">{t.currency}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TransactionPage;
