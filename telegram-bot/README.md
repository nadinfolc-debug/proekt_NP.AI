# Telegram-бот для заявок NP.AI

Заявки с формы «Обсудить проект» приходят вам в Telegram.  
Клиентский код **не** содержит общих секретов: защита — Cloudflare Turnstile + серверная проверка, rate limit и валидация.

## 1. Создайте бота

1. Откройте Telegram → [@BotFather](https://t.me/BotFather)
2. Отправьте `/newbot`
3. Имя, например: `NP.AI Prikolota Alerts`
4. Username, например: `npai_prikolota_bot`
5. Скопируйте **токен** (вид: `7123456789:AAH...`)

## 2. Узнайте свой chat_id

1. Напишите своему боту любое сообщение (например: `привет`)
2. Откройте в браузере (подставьте токен):

```
https://api.telegram.org/bot<ТОКЕН>/getUpdates
```

3. Найдите `"chat":{"id": 123456789` — это ваш `CHAT_ID` (число, может быть отрицательным для группы)

## 3. Turnstile (антиспам)

1. В Cloudflare Dashboard → Turnstile создайте виджет для домена сайта.
2. **Site key** — публичный, для сайта (`VITE_TURNSTILE_SITE_KEY`).
3. **Secret key** — только на Worker / в `telegram-bot/.env` (`TURNSTILE_SECRET_KEY`).

Для локальных тестов можно использовать dummy-ключи Cloudflare (всегда проходят проверку):

- Site: `1x00000000000000000000AA`
- Secret: `1x0000000000000000000000000000000AA`

## 4. Задеплойте Worker (только после отдельного подтверждения)

Нужен аккаунт [Cloudflare](https://dash.cloudflare.com/) и Node.js.

```bash
cd telegram-bot
npm install
npx wrangler login
npm run deploy
```

После деплоя будет URL вида:

```
https://npai-telegram-notify.<ваш-аккаунт>.workers.dev
```

Задайте секреты:

```bash
npm run secret:bot
# вставьте токен бота

npm run secret:chat
# вставьте chat_id

npm run secret:turnstile
# вставьте TURNSTILE_SECRET_KEY
```

Опционально (vars): `ALLOWED_ORIGINS`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`.

Порядок безопасного перехода: `SECURE_CUTOVER.md`.

## 5. Подключите сайт

В корне проекта:

```
VITE_NOTIFY_URL=https://npai-telegram-notify.<ваш-аккаунт>.workers.dev
VITE_TURNSTILE_SITE_KEY=<публичный site key>
```

**Не** добавляйте `TURNSTILE_SECRET_KEY`, `BOT_TOKEN` и старый `VITE_NOTIFY_SECRET` в `VITE_*`.

Перезапустите сайт:

```bash
npm run dev
```

Для GitHub Pages переменные `VITE_*` задаются в CI secrets **до** сборки.

## Быстрый тест без Cloudflare (локально)

1. Создайте `telegram-bot/.env`:

```
BOT_TOKEN=токен_от_BotFather
CHAT_ID=ваш_chat_id
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
PORT=8787
```

2. Запустите:

```bash
cd telegram-bot
node local-server.mjs
```

3. В корне сайта `.env` / `.env.development`:

```
VITE_NOTIFY_URL=http://127.0.0.1:8787
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

4. Перезапустите `npm run dev` и отправьте тестовую заявку с формы (виджет Turnstile с dummy-ключом проходит автоматически).

## Проверка

1. Откройте сайт → «Обсудить проект»
2. Пройдите Turnstile (или dummy в локальном тесте)
3. Отправьте заявку
4. В Telegram должно прийти полное сообщение: имя, услуга, описание, способ связи, контакт
