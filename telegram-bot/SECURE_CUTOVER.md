# Безопасный переход (Turnstile + без клиентского SECRET)

## Не публиковать автоматически

Этот документ — чеклист. Прод-Worker и GitHub Pages меняйте только после локальной проверки и **отдельного подтверждения**.

На момент подготовки кода: продакшен **не** деплоился, живая отправка заявок **не** отключалась.

## Секреты Cloudflare Worker

Задать / сменить в Dashboard → Workers → Settings → Variables / Secrets:

- `BOT_TOKEN`
- `CHAT_ID`
- `TURNSTILE_SECRET_KEY` (секретный ключ виджета, не site key)

Опционально (vars):

- `ALLOWED_ORIGINS` — например `https://nadinfolc-debug.github.io,http://127.0.0.1:5173`
- `RATE_LIMIT_MAX` — по умолчанию `5`
- `RATE_LIMIT_WINDOW_MS` — по умолчанию `600000`

Старый shared `SECRET` / `VITE_NOTIFY_SECRET` новым Worker не используется. После cutover удалите их и при необходимости ротируйте `BOT_TOKEN`.

## Сайт (.env / GitHub Actions secrets)

- `VITE_NOTIFY_URL` — URL Worker
- `VITE_TURNSTILE_SITE_KEY` — публичный site key

Не добавляйте secret key Turnstile и `BOT_TOKEN` в `VITE_*`.

## Локальный тест

1. В `telegram-bot/.env`: `BOT_TOKEN`, `CHAT_ID`,  
   `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA`
2. В корневом `.env` / `.env.development`:  
   `VITE_NOTIFY_URL=http://127.0.0.1:8787`  
   `VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA`
3. `node local-server.mjs` в `telegram-bot/`
4. `npm run dev` в корне
5. Отправьте форму → проверьте полную заявку в Telegram

## Точный порядок безопасного перехода в прод

Делать **по шагам**, с паузой на проверку. Не совмещать «сразу всё».

1. **Создать боевой виджет Turnstile** в Cloudflare для домена Pages (и при необходимости preview). Сохранить site key и secret key.
2. **Задеплоить новый Worker-код** (`worker.js`) с секретами `BOT_TOKEN`, `CHAT_ID`, `TURNSTILE_SECRET_KEY`.  
   Предпочтительно: сначала на **отдельный** Worker URL / route (канареечный), не ломая текущий endpoint, пока сайт ещё шлёт на старый.
3. **Проверить новый Worker** тестовым POST (с реальным Turnstile token) → полная заявка в Telegram. Убедиться, что без token / с битыми полями — отказ.
4. **Прописать в GitHub Actions secrets** (не в клиентский репозиторий):  
   `VITE_NOTIFY_URL` = URL **нового** Worker,  
   `VITE_TURNSTILE_SITE_KEY` = боевой site key.
5. **Собрать и опубликовать сайт** (Pages) одной согласованной выкладкой, чтобы форма и Turnstile появились вместе с новым endpoint.
6. **Проверить на живом сайте**: отправка формы, сообщение в Telegram со всеми полями; в собранном JS нет `NOTIFY_SECRET` / `X-Notify-Secret` / Turnstile secret.
7. **Отключить или удалить старый Worker / старый SECRET** только после успешной проверки п.6. При необходимости ротировать `BOT_TOKEN`.
8. Если что-то сломалось на п.5–6: откатить сайт на предыдущую сборку (старый endpoint ещё жив, если п.7 не сделан) либо временно вернуть `VITE_NOTIFY_URL` на старый Worker до выяснения.

## Откат

Пока старый Worker не удалён (п.7), откат сайта = предыдущая сборка с прежним `VITE_NOTIFY_URL`.  
После удаления старого endpoint откат без восстановления Worker не восстановит заявки.
