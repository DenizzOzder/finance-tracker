import FormButton from "../common/FormButton/FormButton";
import styles from "./EditTransactionForm.module.css";

const EditTransactionForm = ({ onClose, transaction }) => {
  return (
    <div className={styles.editForm}>
      <div className={styles.modal}>
        <h2>Edit transaction</h2>
        <div className={styles.tabs}>
          <span
            className={
              transaction.type === "INCOME" ? styles.typeactive : styles.type
            }
          >
            Income
          </span>{" "}
          /
          <span
            className={
              transaction.type === "EXPENSE" ? styles.typeactive : styles.type
            }
          >
            Expense
          </span>
        </div>

        <label>Car</label>
        <div className={styles.inputRow}>
          <input type="text" defaultValue={transaction.amount} />
          <input
            type="date"
            className={styles.date}
            defaultValue={transaction.transactionDate}
          />
        </div>

        <label>Oil</label>
        <div className={styles.inputRow}>
          <input type="text" defaultValue={transaction.comment || "—"} />
        </div>

        <button className={`${styles.btn} ${styles.save}`}>SAVE</button>
        <button className={`${styles.btn} ${styles.cancel}`}>CANCEL</button>
        <div className={styles.buttonsWrapper}>
          <FormButton
            type={"button"}
            text={"Save"}
            variant={"multiColorButton"}
            handlerFunction={() => dispatch(logout())}
          />
          <FormButton
            type={"button"}
            text={"cancel"}
            variant={"whiteButton"}
            handlerFunction={() => setSelectedTransaction(null)}
          />
        </div>
      </div>
    </div>
  );
};

export default EditTransactionForm;
