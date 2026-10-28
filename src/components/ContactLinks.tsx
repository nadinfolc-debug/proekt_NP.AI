import { Link, useLocation, useNavigate } from "react-router-dom";
import { scrollToSection, type ScrollState } from "../lib/scroll";

export function ContactLinks({
  label = "Обсудить проект",
}: {
  tone?: "write" | "discuss";
  accent?: "telegram" | "none";
  label?: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="contact-links">
      <Link
        className="button button-accent"
        to="/"
        onClick={(event) => {
          if (location.pathname === "/") {
            event.preventDefault();
            scrollToSection("discuss");
            return;
          }
          event.preventDefault();
          navigate("/", { state: { scrollTo: "discuss" } satisfies ScrollState });
        }}
      >
        {label}
      </Link>
    </div>
  );
}
