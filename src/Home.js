import styles from "./css/Home.module.css";
import User from "./User";
import Admin from "./Admin";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0); // 👈 track remount key

  const handleHome = () => {
    setRefreshKey((prev) => prev + 1); // 👈 increment key to force remount
    navigate("/home");
  };

  return (
    <div>
      <div className={styles.navbar}>
        <span className={styles.homebtn} onClick={handleHome}>
          Home
        </span>
      </div>
      {localStorage.getItem("role") === "ADMIN" ? (
        <Admin key={refreshKey} /> // 👈 refresh Admin too if needed
      ) : (
        <User key={refreshKey} handleHome={handleHome} /> // 👈 force new instance of User
      )}
    </div>
  );
}
