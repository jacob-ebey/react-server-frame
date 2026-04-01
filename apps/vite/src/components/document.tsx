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
        <div>{children}</div>
        <Frame src={routes.frames.partials.sidebar.href()} />
      </body>
    </html>
  );
}
