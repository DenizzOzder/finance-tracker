import { useEffect } from "react";
import { X } from "lucide-react";
import styles from "./AddTransactionModal.module.css";
import AddTransactionForm from "../AddTransactionForm/AddTransactionForm";
import useMedia from "../../hooks/useMedia";

export default function AddTransactionModal({ onClose }) {
  const { isMobile } = useMedia();

  // Escape ile kapatma
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${isMobile ? styles.modalMobile : ""}`}
        onClick={(e) => e.stopPropagation()} // modal içine tıklanınca kapanmaması için
      >
        {/* Close Button */}
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={20} />
        </button>

        <h2 className={styles.title}>Add Transaction</h2>

        {/* Form bileşeni çağırılıyor */}
        <AddTransactionForm onClose={onClose} isMobile={isMobile} />
      </div>
    </div>
  );
}
