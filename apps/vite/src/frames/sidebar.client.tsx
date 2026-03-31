"use client";

import { useFrame } from "react-server-frame/client";

import styles from "./sidebar.module.css";

export function ReloadSidebar() {
  const { pending, reload } = useFrame();

  return (
    <button className={styles.reloadSidebar} onClick={reload}>
      Sidebar Reload{pending ? "ing..." : ""}
    </button>
  );
}
