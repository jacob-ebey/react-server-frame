import { Counter } from "../components/counter.tsx";
import { Document } from "../components/document.tsx";
import { routes } from "../routes.ts";

export default function About() {
  return (
    <Document title="Hello, About!">
      <h1>Hello, About!</h1>
      <p>
        Go <a href={routes.frames.home.href()}>Home</a>
      </p>
      <Counter />
    </Document>
  );
}
