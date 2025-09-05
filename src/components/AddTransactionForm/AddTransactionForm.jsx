import { useState, useEffect, useMemo } from "react";
import { Calendar } from "lucide-react";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import styles from "./AddTransactionForm.module.css";
import FormButton from "../common/FormButton/FormButton";
import { useDispatch, useSelector } from "react-redux";
import { addTransaction, getCategories } from "../../redux/transactions/operations";
import { selectCategories } from "../../redux/transactions/selectors";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function AddTransactionForm({ onClose, isMobile }) {
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);

  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [comment, setComment] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Mount'ta kategorileri çek
  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const expenseCategories = useMemo(() => {
    return categories.filter((c) => String(c?.type || "").toUpperCase() === "EXPENSE");
  }, [categories]);

  const incomeDefaultId = useMemo(() => {
    const income = categories.find((c) => String(c?.type || "").toUpperCase() === "INCOME");
    return income?.id || "";
  }, [categories]);

  async function ensureIncomeCategoryId() {
    if (incomeDefaultId && UUID_RE.test(incomeDefaultId)) return incomeDefaultId;

    const action = await dispatch(getCategories());
    const fresh = action?.payload && Array.isArray(action.payload) ? action.payload : categories;

    const income = fresh.find((c) => String(c?.type || "").toUpperCase() === "INCOME");
    if (!income?.id || !UUID_RE.test(income.id)) {
      throw new Error("Income kategorisi bulunamadı ya da geçersiz. Lütfen en az bir gelir kategorisi oluşturun.");
    }
    return income.id;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const raw = parseFloat(amount);
    if (!raw || raw <= 0) return;

    const transactionDate =
      date instanceof Date ? date.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

    const signedAmount = type === "expense" ? -Math.abs(raw) : Math.abs(raw);

    try {
      setSubmitting(true);

      let categoryIdToSend;
      if (type === "expense") {
        if (!selectedCategoryId || !UUID_RE.test(selectedCategoryId)) {
          alert("Please select a valid expense category.");
          setSubmitting(false);
          return;
        }
        categoryIdToSend = selectedCategoryId;
      } else {
        categoryIdToSend = await ensureIncomeCategoryId();
      }

      const payload = {
        transactionDate,
        type: type === "income" ? "INCOME" : "EXPENSE",
        amount: signedAmount,
        comment: comment.trim() || undefined,
        categoryId: categoryIdToSend,
      };

      await dispatch(addTransaction(payload));

      // Reset form
      setAmount("");
      setComment("");
      setDate(new Date());
      setType("income");
      setSelectedCategoryId("");
      setSubmitting(false);

      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Transaction could not be added. Please check category and try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} ${isMobile ? styles.formMobile : ""}`}>
      {/* Income / Expense Toggle */}
      <div
        className={styles.toggle}
        onClick={() => setType(type === "income" ? "expense" : "income")}
        role="button"
        aria-label="Toggle income / expense"
      >
        <div className={`${styles.slider} ${type === "expense" ? styles.expense : ""}`}></div>
        <span className={styles.toggleLabel}>Income</span>
        <span className={styles.toggleLabel}>Expense</span>
      </div>

      {/* Expense Category Select */}
      {type === "expense" && (
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className={`${styles.select} ${isMobile ? styles.selectMobile : ""}`}
          required
        >
          <option value="" disabled hidden>
            Select a category
          </option>
          {expenseCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      )}

      <div className={`${styles.row} ${isMobile ? styles.rowMobile : ""}`}>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`${styles.input} ${isMobile ? styles.inputMobile : ""}`}
          step="0.01"
          min="0"
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
        className={`${styles.comment} ${isMobile ? styles.commentMobile : ""}`}
      />

      {/* Buttons */}
      <div className={styles.buttons}>
        <FormButton
          type="submit"
          text={submitting ? "Adding..." : "Add"}
          variant="multiColorButton"
          disabled={submitting}
        />
        <FormButton type="button" text="Cancel" variant="whiteButton" handlerFunction={onClose} disabled={submitting} />
      </div>
    </form>
  );
}
