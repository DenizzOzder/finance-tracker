import { ClipLoader } from "react-spinners";
import s from "./Loader.module.css";

function Loader() {
  return (
    <div className={s.loaderSpinner}>
      <ClipLoader loading={true} size={80} color="var(--text-color)" aria-label="clip-loader" />
    </div>
  );
}

export default Loader;
