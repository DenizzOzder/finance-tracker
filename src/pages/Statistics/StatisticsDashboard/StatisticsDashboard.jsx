import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./StatisticsDashBoard.module.css";
import { selectTransactions, selectCategories } from "../../../redux/transactions/selectors";
import { getTransactions, getCategories } from "../../../redux/transactions/operations";
import Chart from "../Chart/Chart";
import StatisticsTable from "../StatisticsTable/StatisticsTable";
import Balance from "../../../components/Balance/Balance";
import Header from "../../../components/Header/Header";
import Currency from "../../../components/Currency/Currency";
import Navigation from "../../../components/Navigation/Navigation";
import RuleBotWidget from "../../../components/RuleBot/RuleBotWidget";

const StatisticsDashboard = () => {
  const dispatch = useDispatch();
  const transactions = useSelector(selectTransactions) || [];
  const categories = useSelector(selectCategories) || [];

  const [selectYear, setSelectYear] = useState("");
  const [selectMonth, setSelectMonth] = useState("");

  useEffect(() => {
    dispatch(getTransactions());
    dispatch(getCategories());
  }, [dispatch]);

  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  const transactionsWithCategories = transactions.map((t) => ({
    ...t,
    categoryName: categoryMap[t.categoryId] || "Unknown Category",
  }));

  const filteredList = transactionsWithCategories.filter((item) => {
    const date = new Date(item.transactionDate);
    const matchYear = selectYear !== "" ? date.getFullYear() === Number(selectYear) : true;
    const matchMonth = selectMonth !== "" ? date.getMonth() === Number(selectMonth) : true;
    return matchYear && matchMonth;
  });

  return (

    <>
    <Header />
    <div className={styles.mainWrapper}>
      <div className={styles.leftPanel}>
        <Navigation />
        <Balance />
        <Currency />
      </div>
      <div className={styles.container}>
        <Chart filteredList={filteredList} />
        <StatisticsTable
          filteredList={filteredList}
          categories={categories}
          selectYear={selectYear}
          setSelectYear={setSelectYear}
          selectMonth={selectMonth}
          setSelectMonth={setSelectMonth}
        />
      </div>
    </div>
    <RuleBotWidget />
  </>
  );
};

export default StatisticsDashboard;
