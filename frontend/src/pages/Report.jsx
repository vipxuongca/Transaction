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
  const [report, setReport] = useState({ income: 0, expense: 0 });

  const fetchReport = async () => {
    try {
      const res = await transactionApi.get("http://localhost:8080/reports");
      setReport(res.data);
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

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Income / Expense Report</h1>
      <div className="border p-4 rounded mb-4">
        <p>
          <span className="font-semibold">Total Income:</span> ${report.income}
        </p>
        <p>
          <span className="font-semibold">Total Expense:</span> $
          {report.expense}
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
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportPage;
