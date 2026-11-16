# luinty — personal profile

Адаптивный сайт-профиль без сборщика и npm-зависимостей. HTML, CSS и JavaScript можно менять напрямую.

## Что редактировать

### 1. Описание

Открой `index.html` и найди комментарий `РЕДАКТИРОВАНИЕ ОПИСАНИЯ`. Меняй HTML внутри `<div class="about-copy" id="about-description">` — можно использовать абзацы, `strong`, ссылки и другие обычные HTML-теги.

### 2. Социальные ссылки

В `index.html` найди `<nav class="social-links">` и меняй `href` у Telegram, Discord, Steam и GitHub. Адреса в текущей версии уже заполнены:

- Telegram: `https://t.me/luinty`
- Discord: `https://discord.com/users/1482282821266575400`
- Steam: `https://steamcommunity.com/id/llampillamp`
- GitHub: `https://github.com/lluinty`

### 3. Музыка LXNYA — Sunrise

1. Положи аудиофайл в `assets/`.
2. Назови его `LXNYA - Sunrise.mp3`.
3. Если имя или формат отличаются, измени `TRACK_SRC` в начале `script.js`.

### 4. GitHub contributions

Блок расположен между описанием и социальными ссылками. Переключатели `30д`, `3 месяца` и `Год` меняют период календаря и сумму contributions. Наведи курсор на ячейку, чтобы увидеть дату и количество contributions за этот день.

Данные относятся к профилю `lluinty`. Для получения календаря используется [GitHub Contributions API](https://github.com/grubersjoe/github-contributions-api), который считывает видимую на GitHub странице историю и возвращает число contributions по дням. История в браузер напрямую не запрашивается: статический сайт читает `data/contributions.json`, а это позволяет обойти ограничения CORS и не помещать GitHub-токен в клиентский код. Сервис API кеширует результаты на своей стороне примерно на час.

**Обновить данные вручную:** из корня проекта выполни:

```bash
python scripts/update_contributions.py
```

Нужен доступ к интернету. Скрипт скачает календарь за последний год и сохранит JSON в `data/contributions.json`. Затем запусти сайт через локальный HTTP-сервер:

```bash
python -m http.server 8000
```

Открой `http://localhost:8000`. Не открывай `index.html` как `file://...`: браузер блокирует загрузку локального JSON.

**Автоматическое обновление на GitHub:** в проект добавлен workflow `.github/workflows/update-contributions.yml`. После загрузки папки в репозиторий он обновит JSON при push изменений сайта, а затем будет запускаться ежедневно. Workflow требует разрешения `Contents: Read and write` в настройках репозитория: `Settings → Actions → General → Workflow permissions`. Если первое обновление не запустилось автоматически, открой `Actions → Refresh GitHub contributions → Run workflow`.

Если сайт запущен локально, workflow не выполняется — запускай Python-скрипт вручную. Если GitHub API-сервис временно недоступен, предыдущий JSON останется нетронутым.

### Язык и просмотры сайта

В правом верхнем углу есть переключатель русского и английского языков. Выбор сохраняется в браузере. Счётчик слева показывает загрузки самого сайта (а не посещения GitHub-профиля). Он использует публичный CountAPI без токена или собственного сервера; повторные загрузки страницы тоже учитываются, а доступность значения зависит от внешнего сервиса.

## Структура проекта

- `index.html` — структура страницы, описание и ссылки.
- `styles.css` — цвета, размеры, стеклянные панели, размытия и анимации.
- `script.js` — аудиоплеер, осенние листья, появление секций и contributions-календарь.
- `assets/background-tile.jpg` — повторяющийся тайловый фон.
- `assets/avatar.png` — аватар.
- `data/contributions.json` — данные календаря GitHub.
- `scripts/update_contributions.py` — ручное обновление календаря.
- `.github/workflows/update-contributions.yml` — ежедневное обновление на GitHub Actions.

## Запуск

Открой терминал в папке проекта:

```bash
python scripts/update_contributions.py
python -m http.server 8000
```

Затем открой `http://localhost:8000`.
