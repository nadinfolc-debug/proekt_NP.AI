# Telegram-бот для заявок NP.AI

Заявки с формы «Обсудить проект» приходят вам в Telegram.

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

## 3. Задеплойте Worker (бесплатно)

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

npm run secret:key
# придумайте секрет, например: npai-secret-2026
```

## 4. Подключите сайт

В корне проекта создайте файл `.env` (и `.env.production` при сборке):

```
VITE_NOTIFY_URL=https://npai-telegram-notify.<ваш-аккаунт>.workers.dev
VITE_NOTIFY_SECRET=npai-secret-2026
```

Секрет должен совпадать с `SECRET` у Worker.

Перезапустите сайт:

```bash
npm run dev
```

Для GitHub Pages после деплоя Worker снова соберите и запушьте сайт (`npm run build:docs` + push), чтобы в сборку попали `VITE_*` переменные.

## Быстрый тест без Cloudflare

1. Создайте `telegram-bot/.env`:

```
BOT_TOKEN=токен_от_BotFather
CHAT_ID=ваш_chat_id
SECRET=npai-secret-2026
PORT=8787
```

2. Запустите:

```bash
cd telegram-bot
node local-server.mjs
```

3. В корне сайта `.env`:

```
VITE_NOTIFY_URL=http://localhost:8787
VITE_NOTIFY_SECRET=npai-secret-2026
```

4. Перезапустите `npm run dev` и отправьте тестовую заявку с формы.

Для продакшена на GitHub Pages нужен публичный URL Worker (шаг 3 выше), а `VITE_NOTIFY_*` должны быть заданы **до** `npm run build` / `build:gh`.

## Проверка

1. Откройте сайт → «Обсудить проект»
2. Отправьте тестовую заявку
3. В Telegram должно прийти сообщение от бота
