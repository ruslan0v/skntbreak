# Skntbreak - Система управления перерывами

Система для управления перерывами сотрудников с возможностью отслеживания активных перерывов в реальном времени.

## 🏗️ Архитектура

Проект построен по принципу Clean Architecture с разделением на слои:

- **Skntbreak.Core** - Доменные модели и перечисления
- **Skntbreak.Application** - Бизнес-логика и сервисы
- **SkntBreak.Infrastructure** - Доступ к данным и внешние сервисы
- **Skntbreak.Api** - Web API контроллеры

## 🚀 Быстрый старт

### Требования
- .NET 8.0
- PostgreSQL (для продакшена)
- Visual Studio 2022 или VS Code

### Запуск проекта

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/your-username/skntbreak.git
cd skntbreak
```

2. **Восстановите зависимости:**
```bash
dotnet restore
```

3. **Запустите проект:**
```bash
cd Skntbreak.Api
dotnet run
```

4. **Откройте Swagger UI:**
```
http://localhost:5298/swagger
```

## 📋 Функциональность

### Основные возможности:
- ✅ Аутентификация пользователей
- ✅ Управление расписаниями перерывов
- ✅ Отслеживание активных перерывов
- ✅ Правила и лимиты перерывов
- ✅ Роли пользователей (SL1, SL2, Chatter, TeamLead, Admin)

### API Endpoints:
- `POST /api/breaks/start` - Начать перерыв
- `POST /api/breaks/end` - Завершить перерыв
- `GET /api/breaks/active` - Получить активные перерывы
- `GET /api/auth/login` - Аутентификация
- `GET /api/dashboard` - Дашборд

## 🗄️ База данных

### Сущности:
- **User** - Пользователи системы
- **Schedule** - Расписания работы
- **BreakRule** - Правила перерывов
- **BreakSchedule** - История перерывов пользователей

### Связи:
- User ↔ Schedule (Many-to-One)
- Schedule ↔ BreakRule (One-to-Many)
- User ↔ BreakSchedule (One-to-Many)

## 🔧 Технологии

- **Backend:** ASP.NET Core 8.0
- **Database:** Entity Framework Core + PostgreSQL
- **Real-time:** SignalR (планируется)
- **Documentation:** Swagger/OpenAPI
- **Architecture:** Clean Architecture

## 📝 TODO

- [ ] Настройка Entity Framework
- [ ] Реализация репозиториев
- [ ] Добавление бизнес-логики в сервисы
- [ ] Настройка аутентификации (JWT)
- [ ] Реализация SignalR для real-time обновлений
- [ ] Добавление тестов
- [ ] Настройка CI/CD

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License.

## 👥 Авторы

- Ваше имя - [@your-username](https://github.com/your-username)

## 📞 Поддержка

Если у вас есть вопросы или предложения, создайте Issue в репозитории.

