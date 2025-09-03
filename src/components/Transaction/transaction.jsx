import { useState } from "react";
import { X, Calendar } from "lucide-react";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import styles from "./transaction.module.css";

export default function AddTransactionModal({ onClose }) {
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { type, amount, date, comment };
    console.log("Transaction Added:", data);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Close Button */}
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={20} />
        </button>

        <h2 className={styles.title}>Add transaction</h2>

        {/* Income / Expense Toggle */}
        <div
          className={styles.toggle}
          onClick={() => setType(type === "income" ? "expense" : "income")}
        >
          <div
            className={`${styles.slider} ${
              type === "expense" ? styles.expense : ""
            }`}
          ></div>
          <span className={styles.toggleLabel}>Income</span>
          <span className={styles.toggleLabel}>Expense</span>
        </div>

        {type === "expense" && (
          <select
            name="category"
            id="category"
            className={styles.select}
            defaultValue=""
          >
            <option value="" disabled hidden>
              Select a category
            </option>
            <option value="food" className={styles.option}>Food</option>
            <option value="transport" className={styles.option}>Transport</option>
            <option value="entertainment" className={styles.option}>Entertainment</option>
          </select>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={styles.input}
              required
            />

            <div className={styles.dateWrapper}>
              <DatePicker
                value={date}
                onChange={setDate}
                className="custom-datepicker"
                calendarClassName={styles.calendar}
                clearIcon={null}
                calendarIcon={<Calendar className={styles.calendarIcon} />}
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={styles.comment}
          />

          {/* Buttons */}
          <div className={styles.buttons}>
            <button type="submit" className={styles.addBtn}>
              ADD
            </button>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
