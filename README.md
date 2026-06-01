# Deploy

Автодеплой настроен через GitLab Pages в файле `.gitlab-ci.yml`.

Pipeline запускается при push в default branch и выполняет job `pages`.
Job создает папку `public`, копирует в нее статические файлы проекта и
публикует `public` как artifact для GitLab Pages.

После успешного pipeline сайт доступен в GitLab:

`https://playeble-703ea6.gitlab.io`

Страница настроек Pages в GitLab:

`Deploy > Pages`

Для деплоя достаточно закоммитить изменения и отправить их в GitLab:

```bash
git push
```
