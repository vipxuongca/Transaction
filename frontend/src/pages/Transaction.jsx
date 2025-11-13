import React, { useState, useEffect } from "react";
import { transactionApi } from "../../api/api";
import Swal from "sweetalert2";

const TransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [notes, setNotes] = useState("");
  const [type, setType] = useState("income"); // income | expense

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-5xl p-12">
        <h1 className="text-4xl font-bold text-center text-black mb-10">
          Quản lý chi tiêu
        </h1>

        <div className="mb-10 p-6 border rounded-xl bg-gray-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTransaction();
            }}
            className="flex flex-col md:flex-row gap-4 md:gap-6 items-center justify-center"
          >
            <input
              type="number"
              placeholder="Tổng tiền *"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-4 rounded-lg w-full md:w-1/4 text-lg"
              required
            />
            <input
              type="text"
              placeholder="Ghi chú"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border p-4 rounded-lg w-full md:w-1/4 text-lg"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border p-4 rounded-lg w-full md:w-1/4 text-lg"
              required
            >
              <option value="income">Thu</option>
              <option value="expense">Chi</option>
            </select>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-all w-full md:w-auto"
            >
              Thêm giao dịch
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">Chưa có giao dịch nào.</p>
          ) : (
            <table className="min-w-full border border-gray-300 rounded-lg text-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-4 border-b text-left">Loại giao dịch</th>
                  <th className="py-3 px-4 border-b text-left">Ghi chú</th>
                  <th className="py-3 px-4 border-b text-right">Tổng tiền</th>
                  <th className="py-3 px-4 border-b text-left">Tiền Tệ</th>
                  <th className="py-3 px-4 border-b text-left">Thời gian</th>
                  <th className="py-3 px-4 border-b text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">{t.type === "income" ? "Thu" : "Chi"}</td>
                    <td className="py-3 px-4 border-b">{t.notes || "—"}</td>
                    <td className="py-3 px-4 border-b text-right">
                      {(t.amount_cents / 100).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 border-b">{t.currency}</td>
                    <td className="py-3 px-4 border-b">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 border-b text-center">
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="text-red-500 hover:text-red-700 font-semibold"
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
    </div>
  );
};

export default TransactionPage;
