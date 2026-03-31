import { Frame } from "react-server-frame";

import { routes } from "../routes.ts";

import "./document.css";

export function Document({ children, title }: { children?: React.ReactNode; title: string }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
      </head>
      <body>
        <div>{children}</div>
        <Frame src={routes.frames.partials.sidebar.href()} />
      </body>
    </html>
  );
}
