import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./Statistics.module.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const lightenColor = (color, percent) => {
  const num = parseInt(color.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Statistics = () => {
  const transactions = useSelector((state) => state.transactions.items); // dashboard’dan gelen API verisi
  const [selectMonth, setSelectMonth] = useState("");
  const [selectYear, setSelectYear] = useState("");

  // Dinamik yıllar ve aylar
  const availableYears = useMemo(() => {
    const yearsSet = new Set(transactions.map(t => new Date(t.transactionDate).getFullYear()));
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [transactions]);

  const availableMonths = useMemo(() => {
    const monthsSet = new Set(
      transactions
        .filter(t => !selectYear || new Date(t.transactionDate).getFullYear() === Number(selectYear))
        .map(t => new Date(t.transactionDate).getMonth())
    );
    return Array.from(monthsSet).sort((a, b) => a - b);
  }, [transactions, selectYear]);

  // Filtrelenmiş liste
  const listData = transactions.filter((item) => {
    const d = new Date(item.transactionDate);
    const matchMonth = selectMonth ? d.getMonth() === Number(selectMonth) : true;
    const matchYear = selectYear ? d.getFullYear() === Number(selectYear) : true;
    return matchMonth && matchYear;
  });

  const chartDataItems = listData.filter((item) => item.type === "gider");
  const totalIncome = listData.filter(i => i.type === "gelir").reduce((acc, it) => acc + it.amount, 0);
  const totalExpense = chartDataItems.reduce((acc, it) => acc + it.amount, 0);

  const categories = {};
  chartDataItems.forEach((item) => {
    if (!categories[item.categoryName]) categories[item.categoryName] = 0;
    categories[item.categoryName] += item.amount;
  });

  const labels = Object.keys(categories);
  const values = Object.values(categories);

  const defaultColors = [
    "#FF5733","#33FF57","#FF8C33","#FF33A1","#3357FF",
    "#33FFF6","#F3FF33","#FF33EC","#8C33FF","#33FF8C"
  ];
  const colors = labels.map((_, idx) => defaultColors[idx % defaultColors.length]);
  const hoverColors = colors.map(c => lightenColor(c, 15));

  const data = {
    labels,
    datasets: [{ data: values, backgroundColor: colors, hoverBackgroundColor: hoverColors, borderWidth: 1, hoverOffset: 15 }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: true, position: "bottom", labels: { color: "#fff", boxWidth: 12, padding: 15 } },
      tooltip: {
        enabled: true,
        position: "nearest",
        backgroundColor: "#222",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed} TL` },
      },
    },
    cutout: "70%",
    animation: { animateRotate: true, animateScale: false, duration: 300, easing: "easeOutQuad" },
    hover: { mode: "nearest", intersect: true },
  };
console.log("Transactions from store:", transactions);

  return (
    <>
      <p className={styles.stat}>Statistics</p>
      <div className={styles.container}>
        <div className={styles.leftSide}>
          <div className={styles.chartWrapper}>
            <Doughnut data={data} options={options} />
            <div className={styles.circleTotal}>{totalExpense} TL</div>
          </div>
        </div>

        <div className={styles.rightSide}>
          <div className={styles.filterContainer}>
            <select
              value={selectYear}
              onChange={(e) => setSelectYear(e.target.value)}
              className={styles.selectDark}
              style={{ border: "1px solid #fff", backgroundColor: "#222" }}
            >
              <option value="">Year</option>
              {availableYears.map(y => (
                <option 
                  key={y} 
                  value={y}
                  style={{
                    backgroundColor: selectYear == y ? "#FF868D" : "#fff",
                    color: selectYear == y ? "#fff" : "#000",
                  }}
                >
                  {y}
                </option>
              ))}
            </select>

            <select
              value={selectMonth}
              onChange={(e) => setSelectMonth(e.target.value)}
              className={styles.selectDark}
              style={{ border: "1px solid #fff", backgroundColor: "#222" }}
            >
              <option value="">Month</option>
              {availableMonths.map(m => (
                <option 
                  key={m} 
                  value={m}
                  style={{
                    backgroundColor: selectMonth == m ? "#FF868D" : "#fff",
                    color: selectMonth == m ? "#fff" : "#000",
                  }}
                >
                  {monthNames[m]}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.transactionList}>
            {listData.length === 0 ? (
              <div>Transactions not found</div>
            ) : (
              listData.map((item, idx) => (
                <div key={idx} className={styles.transactionItem}>
                  <div className={styles.transactionInfo}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        className={styles.colorBox}
                        style={{
                          backgroundColor:
                            item.type === "gider"
                              ? colors[labels.indexOf(item.categoryName)]
                              : defaultColors[Math.floor(Math.random() * defaultColors.length)],
                        }}
                      />
                      <span>{item.categoryName}</span>
                    </div>
                    <span>{item.amount} TL</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.summary}>
            <div className={styles.transactionInfo}>
              <span>Expense</span>
              <span style={{ color: "#FF0000", fontWeight: 700 }}>{totalExpense} TL</span>
            </div>
            <div className={styles.transactionInfo}>
              <span>Income</span>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>{totalIncome} TL</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;
