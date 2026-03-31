"use client";

import { useFrame } from "react-server-frame/client";

export function ReloadSidebar() {
  const { pending, reload } = useFrame();

  return <button onClick={reload}>Sidebar Reload{pending ? "ing..." : ""}</button>;
}
