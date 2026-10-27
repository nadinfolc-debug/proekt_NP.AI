import { Link } from "react-router-dom";

export function ContactLinks({
  label = "Обсудить проект",
}: {
  tone?: "write" | "discuss";
  accent?: "telegram" | "none";
  label?: string;
}) {
  return (
    <div className="contact-links">
      <Link className="button button-accent" to="/#contacts">
        {label}
      </Link>
    </div>
  );
}
