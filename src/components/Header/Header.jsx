import { useToggle } from "../../hooks/useToggle";
import logo from "../../images/logo.svg";
import styles from "./Header.module.css";
import { FiLogOut } from "react-icons/fi";
import LogOutModal from "../LogOutModal/LogOutModal";
import { useSelector } from "react-redux";

export default function Header() {
  const { openModal, isOpen, closeModal } = useToggle();
  const { user } = useSelector((state) => state.auth);

  return (
    <header className={styles.header}>
      <div className={styles.logoBox}>
        <img src={logo} alt="Logo" className={styles.logo} />
      </div>

      <div className={styles.userBox}>
        <span className={styles.username}>{user.username}</span>
        <button className={styles.exitBtn} onClick={openModal}>
          <FiLogOut className={styles.exitIcon} />
          Exit
        </button>
        {isOpen && <LogOutModal closeModal={closeModal} />}
      </div>
    </header>
  );
}
