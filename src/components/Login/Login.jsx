import React from "react";
import logo from "./logo.png";
import css from "./Login.module.css";
import { IoMailOutline } from "react-icons/io5";
import { RiLockPasswordLine } from "react-icons/ri";

export default function Login() {
  return (
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
        <button className={css.reg}>REGISTER</button>
      </form>
    </div>
  );
}
