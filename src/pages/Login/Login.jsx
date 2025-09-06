/* filepath: /src/pages/Login/Login.jsx */
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/auth/operations";
import { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { selectIsLoggedIn, selectIsRefreshing } from "../../redux/auth/selectors";
import { selectTransactionsLoading } from "../../redux/transactions/selectors.js";
import logo from "./logo.png";
import css from "./Login.module.css";
import { IoMailOutline } from "react-icons/io5";
import { RiLockPasswordLine } from "react-icons/ri";
import "izitoast/dist/css/iziToast.min.css";
import iziToast from "izitoast";
import Loader from "../../components/Loader/Loader.jsx";

export default function Login() {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectTransactionsLoading);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const isRefreshing = useSelector(selectIsRefreshing);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loc = useLocation();
  const navigate = useNavigate();
  const from = loc.state?.from || "/dashboard";

  useEffect(() => {
    document.title = "Login";
  }, []);

  // Auth durumu yükleniyorsa loader göster
  if (isRefreshing) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #101010 0%, #0E0D12 50%, #0A0A0A 100%)",
        }}
      >
        <Loader />
      </div>
    );
  }

  if (isLoggedIn) return <Navigate to={from} replace />;

  const toRegister = () => navigate("/register");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      iziToast.success({
        title: "Hoşgeldin 👋",
        message: "Giriş başarılı!",
        position: "topRight",
        timeout: 3000,
        class: "custom-success-toast",
        theme: "dark",
      });
    } catch (err) {
      iziToast.error({
        title: "Hata ❌",
        message: err?.message || "Giriş başarısız!",
        position: "topRight",
        timeout: 3000,
        class: "custom-error-toast",
        theme: "dark",
      });
    }
  };

  return (
    <div className={css.shell}>
      <div className={css.bgDecor} />
      <form className={css.Form} onSubmit={onSubmit}>
        <img src={logo} alt="Logo" />
        <div className={css.inputs}>
          <div className={css.inputWrap}>
            <IoMailOutline className={css.icon} />
            <input
              type="email"
              placeholder="Enter Your Mail"
              className={css.text}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={css.inputWrap}>
            <RiLockPasswordLine className={css.icon} />
            <input
              type="password"
              className={css.text}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button className={css.login} type="submit" disabled={isLoading}>
          {isLoading ? <Loader /> : "LOG IN"}
        </button>

        <button className={css.reg} type="button" onClick={toRegister}>
          REGISTER
        </button>
      </form>
    </div>
  );
}
