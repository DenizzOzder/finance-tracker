import logo from "../../images/logo.svg";
import styles from "./Header.module.css";
import { FiLogOut } from "react-icons/fi";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoBox}>
        <img src={logo} alt="Logo" className={styles.logo} />
      </div>

      <div className={styles.userBox}>
        <span className={styles.username}>Name</span>
        <button className={styles.exitBtn}>
          <FiLogOut className={styles.exitIcon} />
          Exit
        </button>
      </div>
    </header>
  );
}
