"use client";

import { useState } from "react";

import styles from "./counter.module.css";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button className={styles.counter} onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
