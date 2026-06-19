## Deploy

Автодеплой настроен через GitHub Pages в файле `.github/workflows/pages.yml`.

Workflow запускается при push в ветку `main` и вручную через `workflow_dispatch`.
Он ставит зависимости, собирает проект через `npm run build`, загружает `dist`
как Pages artifact и публикует сайт через официальный GitHub Pages deploy action.

После успешного workflow сайт будет доступен на GitHub Pages:

`https://frankcompton.github.io/PLAYEBLE/`

В настройках репозитория нужно выбрать источник деплоя:

`Settings > Pages > Build and deployment > Source > GitHub Actions`

Для деплоя достаточно закоммитить изменения и отправить их в GitHub:

```bash
git push
```

## Structure

Редактировать нужно исходники в корне проекта:

- `index.html`
- `style.css`
- `script.js`
- `fx.js`
- `sfx.js`
- `config.js`
- `main.js`
- `build.mjs`
- `assets/`
- `public/assets/pixi.min.js`

`dist/` создается сборкой и вручную не правится.

## What `config.js` controls

`config.js` — это главный файл настроек креатива.

В нем меняются:

- баланс и валюта
- размер сцены
- цвета и визуальная тема
- шрифты
- пути к картинкам и звукам
- символы слотов
- длительности и тайминги
- эффекты и их интенсивность
- стартовый экран
- сценарии спинов
- тексты CTA
- URL оффера

Если нужен рескин, обычно правятся именно эти блоки, а не логика в `script.js`.

## Assets

Все медиа лежат локально, интернет для запуска не нужен:

- картинки и UI: `assets/`
- звук: `assets/sfx/`
- PixiJS: `public/assets/pixi.min.js`

После сборки все нужное попадает в `dist/assets/`.

## Preloader

Preloader уже не чисто визуальный:

- он ждет картинки
- он ждет звуки
- после этого инициализируются FX и игра
- скрывается только когда все готово

## Build

Установка зависимостей:

```bash
npm install
```

Сборка финального пакета:

```bash
npm run build
```

Результат появляется в `dist/`.

## Editing workflow

Если нужно что-то исправить:

1. Меняешь файл в корне проекта
2. Запускаешь `npm run build`
3. Проверяешь `dist/index.html`
4. Отдаешь байерам папку `dist/`

## Notes

- `dist/` должен открываться как статический пакет без интернета
- `node_modules/` и `dist/` игнорируются git
- `.DS_Store` тоже игнорируется
