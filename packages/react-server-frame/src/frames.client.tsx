"use client";

import { createContext, use, useCallback, useMemo, useRef, useState, useTransition } from "react";

type Frame = {
  pending: boolean;
  reload: () => void;
};

const FrameContext = createContext<undefined | Frame>(undefined);
FrameContext.displayName = "FrameContext";

const FetchFrameContext = createContext<
  undefined | ((url: URL, signal: AbortSignal) => Promise<React.ReactNode>)
>(undefined);

export function FetchFrameProvider({
  children,
  fetchFrame,
}: {
  children: React.ReactNode;
  fetchFrame?: (url: URL, signal: AbortSignal) => Promise<React.ReactNode>;
}) {
  return <FetchFrameContext.Provider value={fetchFrame}>{children}</FetchFrameContext.Provider>;
}

export function useFrame() {
  let frame = use(FrameContext);

  if (!frame) {
    throw new Error("useFrame must be used within a Frame / ClientFrame");
  }

  return frame;
}

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof value.then === "function"
  );
}

export function ClientFrame({ children, src }: { children?: React.ReactNode; src: string }) {
  const [_content, setContent] = useState<React.ReactNode | Promise<React.ReactNode>>(children);
  const content = isPromise(_content) ? use(_content) : _content;

  const [pending, startTransition] = useTransition();

  const [lastChildren, setLastChildren] = useState(children);
  if (lastChildren !== children) {
    setLastChildren(children);
    setContent(children);
  }

  const controllerRef = useRef<AbortController>(undefined);

  const fetchFrame = use(FetchFrameContext);

  const reload = useCallback(() => {
    if (!fetchFrame) throw new Error("FetchFrameContext is not provided");

    const thisController = new AbortController();
    startTransition(async () => {
      startTransition(() =>
        setContent(fetchFrame(new URL(src, window.location.href), thisController.signal)),
      );
    });
    controllerRef.current?.abort();
    controllerRef.current = thisController;
  }, [fetchFrame, src]);

  const frame = useMemo(() => {
    const result = {
      pending,
      reload,
    };

    return result;
  }, [pending, reload]);

  return <FrameContext.Provider value={frame}>{content}</FrameContext.Provider>;
}
