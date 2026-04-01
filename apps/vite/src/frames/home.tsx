import { Document } from "../components/document.tsx";
import { Login } from "../components/login.tsx";
import { routes } from "../routes.ts";

export default function Home() {
  return (
    <Document title="Hello, World!">
      <h1>Hello, World!</h1>
      <p>
        Go <a href={routes.frames.about.href()}>About</a>
      </p>
      <Login />
    </Document>
  );
}
