import React from "react";
import PropTypes from "prop-types";
import { useMediaQuery } from "react-responsive";
import styles from "./TransactionsList.module.css";
import TransactionsItem from "./TransactionsItem.jsx";
import ButtonAddTransactions from "./ButtonAddTransactions.jsx";
import emptyTransaction from "../../images/emptytransaction.webp";

const TransactionsList = ({ transactions, onEdit, onDelete, onAdd }) => {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const isEmpty = !transactions || transactions.length === 0;

  return (
    <div className={styles.wrapper}>
      {isMobile ? (
        <div className={styles.mobileContainer}>
          {isEmpty ? (
            <div className={styles.empty}>
              <img src={emptyTransaction} alt="page-not-found" width="240" />
              <p className={styles.emptyTitle}>No transactions yet</p>
              <p className={styles.emptyText}>
                Start by adding your first record.
              </p>
            </div>
          ) : (
            transactions.map((t) => (
              <TransactionsItem
                key={t.id}
                transaction={t}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Comment</th>
                <th>Sum</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isEmpty ? (
                <tr>
                  <td colSpan="6">
                    <div className={styles.empty}>
                      <img
                        src={emptyTransaction}
                        alt="page-not-found"
                        width="240"
                      />

                      <p className={styles.emptyTitle}>No transactions yet</p>
                      <p className={styles.emptyText}>
                        Start by adding your first record.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <TransactionsItem
                    key={t.id}
                    transaction={t}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ButtonAddTransactions onClick={onAdd} />
    </div>
  );
};

TransactionsList.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      transactionDate: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["INCOME", "EXPENSE"]).isRequired,
      categoryName: PropTypes.string.isRequired,
      comment: PropTypes.string,
      amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    })
  ),
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onAdd: PropTypes.func,
};

export default TransactionsList;
