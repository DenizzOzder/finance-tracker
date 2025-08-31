import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/auth/operations";
import { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import logo from "./logo.png";
import css from "./Login.module.css";
import { IoMailOutline } from "react-icons/io5";
import { RiLockPasswordLine } from "react-icons/ri";

export default function Login() {
  // --- HOOKLAR EN ÜSTE ---
  const dispatch = useDispatch();
  const { isLoggedIn, loading, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loc = useLocation();
  const navigate = useNavigate();
  const from = loc.state?.from || "/dashboard";

  // (opsiyonel) sayfa başlığı
  useEffect(() => { document.title = "Login"; }, []);

  // --- KOŞULLU DÖNÜŞ HOOK'LARDAN SONRA ---
  if (isLoggedIn) return <Navigate to={from} replace />;

  const toRegister = () => navigate("/register");

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className={css.shell}>
      <div className={css.bgDecor} />
      <form className={css.Form} onSubmit={onSubmit}>
        <img src={logo} alt="Logo" />
        <div className={css.inputs}>
          <IoMailOutline />
          <input
            type="email"
            placeholder="Enter Your Mail"
            className={css.text}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <RiLockPasswordLine className={css.pass} />
          <input
            type="password"
            className={css.text}
            placeholder="Password"
            value={password}          
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className={css.login} type="submit" disabled={loading}>
          LOG IN
        </button>

        {/* submit etmesin diye type="button" */}
        <button className={css.reg} type="button" onClick={toRegister}>
          REGISTER
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </div>
  );
}
