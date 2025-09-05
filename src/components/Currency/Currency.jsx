import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrencyData,
  selectCurrencyLoading,
} from "../../redux/currency/selectors";
import { getCurrency } from "../../redux/currency/operations";
import styles from "./Currency.module.css";
import CustomChart from "./Chart/Chart";

const Currency = () => {
  const isTablet = useMediaQuery({ query: "(max-width: 1279px)" });
  const dispatch = useDispatch();
  const currencyData = useSelector(selectCurrencyData);
  const isLoading = useSelector(selectCurrencyLoading);

  const usdRateBuy = currencyData?.usd?.buy;
  const euroRateBuy = currencyData?.euro?.buy;
  const usdRateSell = currencyData?.usd?.sell;
  const euroRateSell = currencyData?.euro?.sell;

  useEffect(() => {
    dispatch(getCurrency());
  }, [dispatch]);

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "-";
    return Number(value).toFixed(2);
  };

const data = [
  { value: formatCurrency(usdRateBuy) - 15 },
  { value: formatCurrency(usdRateBuy) },
  { value: formatCurrency(euroRateBuy) - 20 },
  { value: formatCurrency(euroRateBuy) },
  { value: formatCurrency(euroRateBuy) - 15 },
];

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.loading}>Loading currency data...</div>
      ) : (
        <table className={styles.currencyTable}>
          <thead>
            <tr>
              <th>Currency</th>
              <th>Purchase</th>
              <th>Sale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>USD</td>
              <td className={styles.rate}>{formatCurrency(usdRateBuy)}</td>
              <td className={styles.rate}>{formatCurrency(usdRateSell)}</td>
            </tr>
            <tr>
              <td>EUR</td>
              <td className={styles.rate}>{formatCurrency(euroRateBuy)}</td>
              <td className={styles.rate}>{formatCurrency(euroRateSell)}</td>
            </tr>
          </tbody>
        </table>
      )}
      <div>
        <CustomChart data={data}/>
      </div>
    </div>
  );
};

export default Currency;
