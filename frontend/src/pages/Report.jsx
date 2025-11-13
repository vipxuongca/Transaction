import React, { useEffect, useState } from "react";
import { transactionApi } from "../../api/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#4CAF50", "#F44336"]; // green for income, red for expense

const ReportPage = () => {
  const [report, setReport] = useState({
    income: 0,
    expense: 0,
    currency: "VND",
  });

  const fetchReport = async () => {
    try {
      const res = await transactionApi.getReport();
      const dataArray = res.data || [];

      // transform array into object
      const reportData = { income: 0, expense: 0, currency: "VND" };
      dataArray.forEach((r) => {
        if (r.type === "income") reportData.income = r.total_cents;
        else if (r.type === "expense") reportData.expense = r.total_cents;
        if (r.currency) reportData.currency = r.currency;
      });

      setReport(reportData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const data = [
    { name: "Income", value: report.income },
    { name: "Expense", value: report.expense },
  ];

  const formatAmount = (amount) => (amount / 100).toLocaleString();

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Thống kê thu chi</h1>
      <div className="border p-4 rounded mb-4">
        <p>
          <span className="font-semibold">Tổng Thu:</span>{" "}
          {formatAmount(report.income)} {report.currency}
        </p>
        <p>
          <span className="font-semibold">Tổng chi:</span>{" "}
          {formatAmount(report.expense)} {report.currency}
        </p>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              fill="#8884d8"
              label={(entry) => `${entry.name}: ${formatAmount(entry.value)}`}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${formatAmount(value)} ${report.currency}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportPage;
