/* filepath: /src/pages/Statistics/Statistics.jsx */
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./Statistics.module.css";
import { ChevronDown } from "lucide-react";

// Chart.js'in gerekli parçalarını kayıt ediyoruz
ChartJS.register(ArcElement, Tooltip, Legend);

// Rengi hover için biraz açmak için yardımcı fonksiyon
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

// Ay isimleri (map'le döneceğiz)
const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const Statistics = () => {
  // Redux'tan transaction listesini alıyoruz
  const transactions = useSelector((state) => state.transactions || []);
  console.log("stat", transactions)
  // Select kutularının state'leri
  const [selectYear, setSelectYear] = useState("");
  const [selectMonth, setSelectMonth] = useState("");

  // Filtreleme işlemi
  const filteredList = transactions.filter(item => {
    const date = new Date(item.transactionDate);
    const matchYear = selectYear !== "" ? date.getFullYear() === Number(selectYear) : true;
    const matchMonth = selectMonth !== "" ? date.getMonth() === Number(selectMonth) : true;
    return matchYear && matchMonth;
  });

  // Giderleri alıyoruz
  const chartDataItems = filteredList.filter(item => item.type === "EXPENSE");

  // Toplam gelir ve gider
  const totalIncome = filteredList
    .filter(i => i.type === "INCOME")
    .reduce((acc, i) => acc + Number(i.amount), 0);

  const totalExpense = chartDataItems
    .reduce((acc, i) => acc + Number(i.amount), 0);

  // Kategorilere göre gruplama
  const categories = {};
  chartDataItems.forEach(item => {
    if (!categories[item.categoryName]) categories[item.categoryName] = 0;
    categories[item.categoryName] += Number(item.amount);
  });

  const labels = Object.keys(categories);   // kategori isimleri
  const values = Object.values(categories); // kategoriye göre toplamlar

  // Renkler
  const defaultColors = [
    "#FF5733","#33FF57","#FF8C33","#FF33A1","#3357FF",
    "#33FFF6","#F3FF33","#FF33EC","#8C33FF","#33FF8C"
  ];
  const colors = labels.map((_, idx) => defaultColors[idx % defaultColors.length]);
  const hoverColors = colors.map(c => lightenColor(c, 15));

  // Chart verileri
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        hoverBackgroundColor: hoverColors,
        borderWidth: 1,
        hoverOffset: 15,
      }
    ]
  };

  // Chart ayarları
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { 
        display: true, 
        position: "bottom", 
        labels: { color: "#fff", boxWidth: 12, padding: 15 } 
      },
      tooltip: {
        enabled: true,
        callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed} TL` },
      },
    },
    cutout: "70%",
    animation: { animateRotate: true, duration: 300, easing: "easeOutQuad" },
  };

  return (
    <>
      <p className={styles.stat}>Statistics</p>
      <div className={styles.container}>
        {/* Sol taraf: Chart */}
        <div className={styles.leftSide}>
          <div className={styles.chartWrapper}>
            <Doughnut data={data} options={options} />
            <div className={styles.circleTotal}>{totalExpense} </div>
          </div>
        </div>

        {/* Sağ taraf: filtre + liste */}
        <div className={styles.rightSide}>
          <div className={styles.filterContainer}>
            
            {/* Year Select */}
            <div className={styles.selectWrapper}>
              <select
                value={selectYear}
                onChange={e => setSelectYear(e.target.value)}
                className={styles.selectDark}
              >
                <option value="">Year</option>
                {Array.from({ length: 6 }, (_, i) => 2020 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className={styles.selectIcon} />
            </div>

            {/* Month Select */}
            <div className={styles.selectWrapper}>
              <select
                value={selectMonth}
                onChange={e => setSelectMonth(e.target.value)}
                className={styles.selectDark}
              >
                <option value="">Month</option>
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.selectIcon} />
            </div>
          </div>

          {/* Transaction List */}
          <div className={styles.transactionList}>
            {filteredList.length === 0 ? (
              <div>Transactions not found</div>
            ) : (
              filteredList.map((item, idx) => (
                <div key={idx} className={styles.transactionItem}>
                  <div className={styles.transactionInfo}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div 
                        className={styles.colorBox} 
                        style={{ 
                          backgroundColor: item.type === "EXPENSE" 
                            ? colors[labels.indexOf(item.categoryName)] 
                            : defaultColors[Math.floor(Math.random() * defaultColors.length)] 
                        }} 
                      />
                      <span>{item.categoryName}</span>
                    </div>
                    <span>{item.amount} </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <div className={styles.transactionInfo}>
              <span>Expense</span>
              <span style={{ color: "#FF0000", fontWeight: 700 }}>{totalExpense} </span>
            </div>
            <div className={styles.transactionInfo}>
              <span>Income</span>
              <span style={{ color: "#FFD700", fontWeight: 700 }}>{totalIncome} </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;
