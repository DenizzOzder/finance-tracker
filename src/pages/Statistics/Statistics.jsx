import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { mockTransactions } from "../../redux/mockTransactions";
import styles from "./Statistics.module.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const lightenColor = (color, percent) => {
  const num = parseInt(color.replace("#",""),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
  return "#" + (
    0x1000000 + 
    (R<255?R<1?0:R:255)*0x10000 + 
    (G<255?G<1?0:G:255)*0x100 + 
    (B<255?B<1?0:B:255)
  ).toString(16).slice(1);
};

const Statistics = () => {
  const allTransactions = mockTransactions;
  const [selectMonth, setSelectMonth] = useState("");
  const [selectYear, setSelectYear] = useState("");
  const [theme, setTheme] = useState("dark");

  const listData = allTransactions.filter((item) => {
    const itemDate = new Date(item.transactionDate);
    const matchMonth = selectMonth ? itemDate.getMonth() + 1 === Number(selectMonth) : true;
    const matchYear = selectYear ? itemDate.getFullYear() === Number(selectYear) : true;
    return matchMonth && matchYear;
  });

  const chartDataItems = listData.filter((item) => item.type === "gider");

  const totalIncome = listData
    .filter((item) => item.type === "gelir")
    .reduce((acc, it) => acc + it.amount, 0);

  const totalExpense = chartDataItems.reduce((acc, it) => acc + it.amount, 0);

  const categories = {};
  chartDataItems.forEach((item) => {
    if (!categories[item.categoryName]) categories[item.categoryName] = 0;
    categories[item.categoryName] += item.amount;
  });

  const labels = Object.keys(categories);
  const values = Object.values(categories);

  const defaultColors = [
    "#FF5733", "#33FF57", "#FF8C33", "#FF33A1", "#3357FF",
    "#33FFF6", "#F3FF33", "#FF33EC", "#8C33FF", "#33FF8C"
  ];
  const colors = labels.map((label, idx) => defaultColors[idx % defaultColors.length]);
  const hoverColors = colors.map(c => lightenColor(c, 20));

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        hoverBackgroundColor: hoverColors,
        borderWidth: 1,
        hoverOffset: 0, // slice boyutu değişmesin
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        position: "nearest", // slice üzerine sabitle
        yAlign: "center",
        xAlign: "center",
        backgroundColor: theme === "dark" ? "#222" : "#fff",
        titleColor: theme === "dark" ? "#fff" : "#000",
        bodyColor: theme === "dark" ? "#fff" : "#000",
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed} TL`,
        },
      },
    },
    cutout: "70%",
    animation: {
      animateRotate: true,
      animateScale: false, // hover ile büyüme olmasın
      duration: 500,
      easing: "easeOutQuad",
    },
    hover: {
      mode: "nearest",
      intersect: true,
    },
  };

  return (
    <div className={`${styles.container} ${theme === "dark" ? styles.dark : styles.light}`}>
      <div className={styles.leftSide}>
        <div className={styles.chartContainer}>
          <Doughnut data={data} options={options} />
          <div
            className={styles.circleTotal}
            style={{ color: theme === "dark" ? "#fff" : "#000" }}
          >
            {totalExpense} TL
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            Tema Değiştir
          </button>
        </div>
      </div>

      <div className={styles.rightSide}>
        <div className={styles.filterContainer}>
          <select
            value={selectMonth}
            onChange={(e) => setSelectMonth(e.target.value)}
            className={theme === "dark" ? styles.selectDark : styles.selectLight}
          >
            <option value="">Ay Seç</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>

          <select
            value={selectYear}
            onChange={(e) => setSelectYear(e.target.value)}
            className={theme === "dark" ? styles.selectDark : styles.selectLight}
          >
            <option value="">Yıl Seç</option>
            {[2020, 2021, 2022, 2023, 2024, 2025].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className={styles.transactionList}>
          {listData.length === 0 ? (
            <div style={{ color: theme === "dark" ? "#fff" : "#000" }}>İşlem bulunamadı</div>
          ) : (
            listData.map((item, idx) => (
              <div key={idx} className={styles.transactionItem}>
                <div className={styles.transactionInfo} style={{ color: theme === "dark" ? "#fff" : "#000" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className={styles.colorBox} style={{ backgroundColor: item.type === "gelir" ? "green" : "red" }} />
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
            <span>Gelir</span>
            <span>{totalIncome} TL</span>
          </div>
          <div className={styles.transactionInfo}>
            <span>Gider</span>
            <span>{totalExpense} TL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
