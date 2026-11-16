export const navItems = [
  { section: "help", label: "Услуги" },
  { section: "projects", label: "Проекты" },
  { section: "about", label: "Обо мне" },
  { section: "reviews", label: "Отзывы" },
  { section: "discuss", label: "Обсудить проект" },
] as const;

export type SocialLink = {
  id: "telegram" | "vk" | "max";
  href: string;
  label: string;
  cta: string;
};

/**
 * MAX button is hidden while href is empty.
 * Saved link: https://max.ru/u/f9LHodD0cOIXrC0-2Ju9bOCN-6fMcOiaCvfg9qZa2FQNjbbMvifb_TNOYGY
 * Paste a new link into href when the button should show again.
 */
export const socialLinks: Record<"telegram" | "vk" | "max", SocialLink> = {
  telegram: {
    id: "telegram",
    href: "https://t.me/NP_AI_Prikolota",
    label: "Telegram",
    cta: "Написать в Telegram",
  },
  vk: {
    id: "vk",
    href: "https://vk.ru/np.ai_prikolota",
    label: "ВКонтакте",
    cta: "Написать во ВКонтакте",
  },
  max: {
    id: "max",
    href: "",
    label: "MAX",
    cta: "Написать в MAX",
  },
};

export const contactChannels = (Object.values(socialLinks) as SocialLink[]).filter(
  (item) => Boolean(item.href.trim()),
);
