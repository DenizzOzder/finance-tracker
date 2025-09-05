import Currency from "../Currency";
import Navigation from "../../Navigation/Navigation";
import { Outlet } from "react-router-dom";
import css from './CurrencyLayout.module.css';

function CurrencyLayout() {
  return (
    <div className={css.container}>
      <nav><Navigation /></nav> 
      <div className={css.currcency}><Currency /></div>
      <div>
        <Outlet />    
      </div>
      {/* Child route buraya render edilir */}
    </div>
  );
}

export default CurrencyLayout;
