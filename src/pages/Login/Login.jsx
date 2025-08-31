import React from "react";
import logo from "./logo.png";
import css from "./Login.module.css";
import { IoMailOutline } from "react-icons/io5";
import { RiLockPasswordLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";


export default function Login() {

  const navigate = useNavigate();
  const toRegister = () => {
    navigate("/register");
  }
  return (
    <>
    <title>Login</title>
    <div className={css.shell}>
      <div className={css.bgDecor} />
      <form className={css.Form}>
        <img src={logo} alt="" />
        <div className={css.inputs}>
          <IoMailOutline />
          <input
            type="email"
            placeholder={`Enter Your Mail`}
            className={css.text}
          />
          <RiLockPasswordLine className={css.pass} />
          <input type="password" className={css.text} placeholder="Password" />
        </div>
        <button className={css.login}>LOG IN</button>
        <button className={css.reg} onClick={toRegister}>REGISTER</button>
      </form>
    </div>
    </>
  );
}
