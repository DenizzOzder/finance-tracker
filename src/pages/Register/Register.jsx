import React from "react";
import logo from "./logo.png";
import css from "./Register.module.css";
import { IoMailOutline } from "react-icons/io5";
import { RiLockPasswordLine } from "react-icons/ri";
import { MdPerson2 } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();
  const toLogin = () => {
    navigate("/");
  }
  
  return (
    <>
    <title>Register</title>
    <div className={css.shell}>
      <div className={css.bgDecor} />
      <form className={css.Form}>
        <img src={logo} alt="" />
        <div className={css.inputs}>
          <MdPerson2 />
          <input type="text" placeholder="Name" className={css.text} />
          <IoMailOutline className={css.mail} />
          <input type="email" placeholder={`E-mail`} className={css.text} />
          <RiLockPasswordLine className={css.pass} />
          <input type="password" className={css.text} placeholder="Password" />
          <RiLockPasswordLine className={`${css.pass} ${css.Confirmpass}`} />
          <input
            type="password"
            className={`${css.text} `}
            placeholder="Confirm Password"
          />
        </div>
        <button className={css.login} >REGISTER</button>
        <button className={css.reg} onClick={toLogin}>LOG IN</button>
      </form>
    </div>
    </>
  );
}
