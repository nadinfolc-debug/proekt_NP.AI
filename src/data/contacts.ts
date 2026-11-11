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
 * MAX: paste your invite link (https://max.ru/u/...) when ready.
 * How to copy: MAX → Профиль → «Пригласить друзей» → «Скопировать ссылку».
 * Leave href empty to hide the button until the link is set.
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
    href: "https://max.ru/u/f9LHodD0cOIXrC0-2Ju9bOCN-6fMcOiaCvfg9qZa2FQNjbbMvifb_TNOYGY",
    label: "MAX",
    cta: "Написать в MAX",
  },
};

export const contactChannels = (Object.values(socialLinks) as SocialLink[]).filter(
  (item) => Boolean(item.href.trim()),
);
