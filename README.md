# Deploy

Автодеплой настроен через GitHub Pages в файле `.github/workflows/pages.yml`.

Workflow запускается при push в ветку `main` и вручную через `workflow_dispatch`.
Он копирует статические файлы проекта в `_site`, загружает их как Pages artifact
и публикует сайт через официальный GitHub Pages deploy action.

После успешного workflow сайт будет доступен на GitHub Pages:

`https://frankcompton.github.io/PLAYEBLE/`

В настройках репозитория нужно выбрать источник деплоя:

`Settings > Pages > Build and deployment > Source > GitHub Actions`

Для деплоя достаточно закоммитить изменения и отправить их в GitHub:

```bash
git push
```
