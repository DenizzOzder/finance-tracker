import styles from "./PassControl.module.css";

export default function PassControl({ password }) {
  const scorePassword = (p) => {
    const hasLower = /[a-z]/.test(p);
    const hasUpper = /[A-Z]/.test(p);
    const hasDigit = /\d/.test(p);

    if (/^[a-zA-Z]+$/.test(p) && p.length > 0) {
      return { percent: 33, color: "#FF4D6D", label: "Zayıf" };
    }
    if (hasLower && hasDigit && !hasUpper) {
      return { percent: 66, color: "#FFD166", label: "Orta" };
    }
    if (hasLower && hasDigit && hasUpper && p.length >= 10) {
      return { percent: 100, color: "#06D6A0", label: "Güçlü" };
    }
    if (!p) return { percent: 0, color: "transparent", label: "" };

    return { percent: 33, color: "#FF4D6D", label: "Zayıf" };
  };

  const s = scorePassword(password);

  return (
    <div className={styles.wrap}>
      <div className={styles.barOuter}>
        <div
          className={styles.barInner}
          style={{ width: `${s.percent}%`, backgroundColor: s.color }}
        />
      </div>
      <div className={styles.hint}>{s.label}</div>
    </div>
  );
}
