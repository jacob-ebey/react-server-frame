import { ViewTransition } from "react";
import { Frame } from "react-server-frame";

import { routes } from "../routes.ts";

import "./document.css";

export function Document({ children }: { children?: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ViewTransition>
          <div>{children}</div>
        </ViewTransition>
        <Frame src={routes.frames.partials.sidebar.href()} />
      </body>
    </html>
  );
}
