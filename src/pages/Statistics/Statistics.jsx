import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // Redux kullanıyorsak
import { selectTransactions } from "../redux/selectors"; // Selector dosyan varsa

import styles from "./StatisticsPage.module.css"; // CSS en sona

const Statistics = () => {
  // Dashboard'dan gelen işlemler
  const allTransactions = useSelector(selectTransactions); 

  const [selectMonth, setSelectMonth] = useState("");
  const [selectYear, setSelectYear] = useState("");

  // Sadece giderleri filtrele ve ay/yıla göre filtre uygula
  const filteredData = allTransactions.filter((item) => {
    if (item.type !== "gider") return false;
    const itemDate = new Date(item.date);
    const matchMonth = selectMonth ? itemDate.getMonth() + 1 === Number(selectMonth) : true;
    const matchYear = selectYear ? itemDate.getFullYear() === Number(selectYear) : true;
    return matchMonth && matchYear;
  });

  // Özet hesaplamaları
  const totalExpense = filteredData.reduce((acc, it) => acc + it.amount, 0);
  const initialBalance = 0;
  const balance = initialBalance - totalExpense;

  // Kategoriler ve renkler
  const categories = {};
  filteredData.forEach((item) => {
    if (!categories[item.category]) categories[item.category] = 0;
    categories[item.category] += item.amount;
  });
  const labels = Object.keys(categories);
  const values = Object.values(categories);
  const categoryColors = {
    "araba": "#FF5733",
    "market": "#33FF57",
    "yatırım": "#FF8C33",
    "eğlence": "#FF33A1",
    "maaş": "#3357FF",
  };
  const colors = labels.map((label) => categoryColors[label] || "#ccc");

  const [hoverValue, setHoverValue] = useState(null);

  return (
    <div className={styles.container}>
      <div className={styles.leftSide}>
        {/* Circle Chart */}
        <div className={styles.chartContainer}>
          <svg viewBox="0 0 36 36">
            {values.map((val, idx) => {
              const radius = 16;
              const circumference = 2 * Math.PI * radius;
              const dashArray = `${(val / totalExpense) * circumference} ${circumference}`;
              return (
                <circle
                  key={idx}
                  r={radius}
                  cx="18"
                  cy="18"
                  fill="transparent"
                  stroke={colors[idx]}
                  strokeWidth="8"
                  strokeDasharray={dashArray}
                  strokeDashoffset="0"
                  onMouseEnter={() => setHoverValue(`${val} TL`)}
                  onMouseLeave={() => setHoverValue(null)}
                />
              );
            })}
          </svg>
          <div className={styles.circleTotal}>
            Toplam Gider: {totalExpense} TL
          </div>
          {hoverValue && <div className={styles.circleHover}>{hoverValue}</div>}
        </div>
      </div>

      <div className={styles.rightSide}>
        {/* Filter */}
        <div className={styles.filterContainer}>
          <select value={selectMonth} onChange={(e) => setSelectMonth(e.target.value)}>
            <option value="">Ay Seç</option>
            <option value="1">Ocak</option>
            <option value="2">Şubat</option>
            <option value="3">Mart</option>
            <option value="4">Nisan</option>
            <option value="5">Mayıs</option>
            <option value="6">Haziran</option>
            <option value="7">Temmuz</option>
            <option value="8">Ağustos</option>
            <option value="9">Eylül</option>
            <option value="10">Ekim</option>
            <option value="11">Kasım</option>
            <option value="12">Aralık</option>
          </select>

          <select value={selectYear} onChange={(e) => setSelectYear(e.target.value)}>
            <option value="">Yıl Seç</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        {/* Transaction List */}
        <div className={styles.transactionList}>
          {filteredData.length === 0 ? (
            <div>İşlem bulunamadı</div>
          ) : (
            filteredData.map((item, idx) => (
              <div key={idx} className={styles.transactionItem}>
                <div
                  className={styles.colorBox}
                  style={{ backgroundColor: categoryColors[item.category] || "#ccc" }}
                />
                <div className={styles.transactionInfo}>
                  <span>{item.category}</span>
                  <span>{item.amount} TL</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <div>Toplam Gider: {totalExpense} TL</div>
          <div>Bakiye: {balance} TL</div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
