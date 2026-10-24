# NP.AI Prikolota

Сайт бренда: AI-контент и сайты для бизнеса. Первая локальная версия без backend и без публикации.

Старый макет личного портфолио лежит в `archive/previous-portfolio.html` и на сайт не влияет.

## Запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:5173/

В режиме разработки видны черновики серии VESPER. Ролик «Снежный кадр» виден и в обычной сборке: это авторский концепт, не клиентский кейс.

## Сборка

Обычная сборка скрывает незавершённые проекты и не кладёт черновые видео в `dist`:

```bash
npm run build
npm run preview
```

Просмотр сборки с черновиками, как на локальном сайте:

```bash
npm run build:drafts
npm run preview
```

`npm run preview:drafts` делает то же самое одной командой.

Готовый сайт — папка `dist`. Её можно отдать на статический хостинг. Для адресов вроде `/projects/slug` хостинг должен отдавать `index.html`. В проекте уже есть `public/_redirects` для Netlify и копия `404.html` для части других хостингов.

## GitHub Pages

Репозиторий: https://github.com/nadinfolc-debug/proekt_NP.AI

После пуша в `main` workflow `Deploy GitHub Pages` собирает сайт (`npm run build:gh`) и публикует его. В настройках репозитория → **Pages** → Source: **GitHub Actions**.

Адрес: https://nadinfolc-debug.github.io/proekt_NP.AI/

## Где менять тексты

- Услуги, процесс, вопросы, заголовки главной: `src/data/site.ts`
- Telegram и ВКонтакте: `src/data/contacts.ts`
- Проекты: `src/data/projects.ts`
- Сравнение «исходник / сцена»: `src/data/compare.ts`
- Цвета и шрифт: `src/styles/tokens.css`

Контакты сейчас:

- https://t.me/NP_AI_N
- https://vk.ru/np_ai_portfolio

## Как подставить свои материалы

1. Положите файлы в `public/media/...`. Оригиналы можно оптимизировать в WebP и оставить JPG рядом.
2. В карточке проекта замените `kind: "slot"` на изображение или видео и укажите пути, ширину, высоту и alt.
3. Уберите подготовленный файл из массива `missing`.
4. Когда работу можно показывать публично, перенесите объект из `draftProjects` в `readyProjects` и поставьте `status: "ready"`.
5. Файлы из `public/media/drafts` в обычную сборку не попадают. Для публикации перенесите их в `public/media`, без папки `drafts`, и обновите пути.
6. Если проект без заказчика, оставьте `isConcept: true`. На карточке будет «Авторский концепт».
7. Демоссылку сайта добавляйте только в `demoUrl`, когда сайт реально открывается.

Первый экран — ролик на всю высоту окна: `public/media/hero/`. Текст и одна ссылка «Смотреть работы» лежат поверх. Лента кадров берёт `public/media/snow/`. Пути героя заданы в `src/components/home/Hero.tsx`.

Сравнение «исходник / сцена» подготовлено в `src/data/compare.ts` и на главную не выведено, пока пары кадров нет.

## Черновик ролика

В локальной версии на первом экране, в ленте работ и в проекте «Снежный кадр» стоит файл, переданный как `0 (16).mp4`: горизонтальный имиджевый ролик около 27 секунд, 1280×720.

Это не клиентский кейс и не часть серии VESPER. Файлы лежат в `public/media/snow/` и попадают в обычную сборку.

Речь в звуке отсюда не проверялась. Если она есть, добавьте `public/media/snow/captions.vtt` и укажите его в данных проекта.

## Недостающие файлы

Серия VESPER — авторский концепт парфюма. Картинок и лендинга пока нет, чужие работы вместо них не подставлены.

```
public/media/vesper/cover.webp
public/media/vesper/image-01.webp
public/media/vesper/image-02.webp
public/media/vesper/image-03.webp
public/media/vesper/source.webp
public/media/vesper/result.webp
public/media/vesper/vertical.mp4
public/media/vesper/video.mp4
public/media/vesper/video-cover.webp
public/media/vesper-site/cover.webp
public/media/vesper-site/desktop-01.webp
public/media/vesper-site/desktop-02.webp
public/media/vesper-site/mobile-01.webp
public/media/snow/captions.vtt
```

Последний файл нужен только если в ролике «Снежный кадр» есть речь.

Демосайт VESPER и производство ролика этой серии — отдельные задачи. Карточка в портфолио их не заменяет.

## Индексация

Сайт собран как одностраничное приложение. В `index.html` есть описание и разметка организации, на главной в браузере добавляется разметка вопросов. Заголовок страницы меняется при переходе. Для поисковиков этого мало: без отдельной предгенерации HTML робот может увидеть в основном оболочку. Домен не выбран, поэтому публичный адрес, canonical и sitemap не прописаны. `public/robots.txt` разрешает обход. Open Graph указывает на `/og.jpg` относительно текущего сайта.

## Что уже есть в репозитории

- React, TypeScript, Vite
- Главная, портфолио с фильтрами, страницы проектов, 404
- Локальный шрифт Manrope
- Черновой ролик, постер и три кадра в `public/media/snow/` и копия героя в `public/media/hero/`
