import { contacts } from "../data/contacts";

type Tone = "write" | "discuss";

const labels: Record<Tone, { telegram: string; vk: string }> = {
  write: {
    telegram: "Обсудить в Telegram",
    vk: "Написать во ВКонтакте",
  },
  discuss: {
    telegram: "Обсудить в Telegram",
    vk: "Написать во ВКонтакте",
  },
};

export function ContactLinks({
  tone = "write",
  accent = "telegram",
}: {
  tone?: Tone;
  accent?: "telegram" | "none";
}) {
  const text = labels[tone];
  return (
    <div className="contact-links">
      <a
        className={accent === "telegram" ? "button button-accent" : "button"}
        href={contacts.telegram}
        target="_blank"
        rel="noopener noreferrer"
      >
        {text.telegram}
        <span className="visually-hidden">, откроется в новой вкладке</span>
      </a>
      <a className="button" href={contacts.vk} target="_blank" rel="noopener noreferrer">
        {text.vk}
        <span className="visually-hidden">, откроется в новой вкладке</span>
      </a>
    </div>
  );
}
