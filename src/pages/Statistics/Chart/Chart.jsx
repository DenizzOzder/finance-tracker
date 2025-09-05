import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./Chart.module.css";

// Chart.js register
ChartJS.register(ArcElement, Tooltip, Legend);

// Renkleri açmak için yardımcı fonksiyon
const lightenColor = (color, percent) => {
  const num = parseInt(color.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;
  return "#" + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
};

const Chart = ({ filteredList }) => {
  const chartDataItems = filteredList.filter((item) => item.type === "EXPENSE");

  const totalExpense = chartDataItems.reduce(
    (acc, i) => acc + Math.abs(Number(i.amount)),
    0
  );

  const categoriesGrouped = {};
  chartDataItems.forEach((item) => {
    if (!categoriesGrouped[item.categoryName]) categoriesGrouped[item.categoryName] = 0;
    categoriesGrouped[item.categoryName] += Number(item.amount);
  });

  const labels = Object.keys(categoriesGrouped);
  const values = Object.values(categoriesGrouped);

  const defaultColors = [
    "#FF5733","#33FF57","#FF8C33","#FF33A1",
    "#3357FF","#33FFF6","#F3FF33","#FF33EC",
    "#8C33FF","#33FF8C"
  ];
  const colors = labels.map((_, idx) => defaultColors[idx % defaultColors.length]);
  const hoverColors = colors.map((c) => lightenColor(c, 15));

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        hoverBackgroundColor: hoverColors,
        borderWidth: false,
        hoverOffset: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    layout: { padding: 20 },
    plugins: {
      legend: { display: false, position: "bottom", labels: { color: "#fff", boxWidth: 12, padding: 15 } },
      tooltip: { enabled: true, callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed} TL` } },
    },
    cutout: "70%",
    animation: { animateRotate: true, duration: 300, easing: "easeOutQuad" },
  };

  return (
    <div className={styles.leftSide}>
      <p className={styles.stat}>Statistics</p>
      <div className={styles.chartWrapper}>
        {chartDataItems.length === 0 ? (
          <div className={styles.emptyChartMessage}>
            <span>Add some expenses to see the chart.</span>
            <span>Your balance is 0.00</span>
          </div>
        ) : (
          <>
            <Doughnut data={data} options={options} />
            <div className={styles.circleTotal}>₺ {Math.abs(totalExpense)}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chart;
