"use client";

import { useState } from "react";

import styles from "./button.module.css";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button className={styles.button} onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
