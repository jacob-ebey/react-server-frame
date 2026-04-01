"use client";

import { useFrame } from "react-server-frame/client";

import styles from "../components/button.module.css";

export function ReloadSidebar() {
  const { pending, reload } = useFrame();

  return (
    <button className={styles.button} onClick={reload}>
      Sidebar Reload{pending ? "ing..." : ""}
    </button>
  );
}
