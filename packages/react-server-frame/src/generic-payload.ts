import type { ReactFormState } from "react-dom/client";

export type Payload =
  | {
      type: "render";
      root: React.ReactNode;
      returnValue?: Promise<unknown>;
      formState?: ReactFormState;
    }
  | {
      type: "redirect";
      redirect: string;
      returnValue?: Promise<unknown>;
      formState?: undefined;
    };
