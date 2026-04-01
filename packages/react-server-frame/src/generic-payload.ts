import type { ReactFormState } from "react-dom/client";

export type Payload = {
  root: React.ReactNode;
  returnValue?: Promise<unknown>;
  formState?: ReactFormState;
};
