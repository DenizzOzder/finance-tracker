import React from "react";
import PropTypes from "prop-types";
import { IoAddSharp } from "react-icons/io5";
import styles from "./ButtonAddTransactions.module.css";

const ButtonAddTransactions = ({ onClick }) => {
  return (
    <button  type="button" className={styles.btn} onClick={onClick}>
        <IoAddSharp className={styles.icon} />
      </button>
  );
};

ButtonAddTransactions.propTypes = { onClick: PropTypes.func };

export default ButtonAddTransactions;
