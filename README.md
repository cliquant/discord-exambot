[![EXAMBOT](https://i.imgur.com/aPjk6vT.png)](https://github.com/cliquant)

> [!NOTE]
> The bot was created for the JPTC challenge, for my own experience and to help students prepare for their exams. ( The bot is in  latvian for now - I haven't finished language system. )

> [!TIP]
> Cannot use NODEMON since I'm using JSON database and it's all time updating, NODEMON thinks it's updating the code when database being used.

## Commands:

```
/help - Explains how the bot works.
/profile - View your profile/progress.
/top - With this command you can see the top users ( you can get points by doing training ).
/books - With this command it is possible to read ( a book ) about a specific topic.
/train - With this command it is possible to start a training to test your knowledge.
/stop - With this command it is possible to stop a training.
/active - With this command it is possible to see who is currently training.
```

## Channels:

You're able to disable/enable them in .env if you want only commands based all.

## .env

```
AUTHOR="CLIQUANT"

DISCORD_BOT_TOKEN=""
DISCORD_BOT_ID=""

DISCORD_GUILD_ID=""

GUILD_TRAIN_CHANNEL_ID=""
GUILD_TOP_CHANNEL_ID=""
GUILD_LOG_CHANNEL_ID=""
GUILD_BOOKS_CHANNEL_ID=""
GUILD_START_CHANNEL_ID=""

START_CHANNEL_ENABLED=true
BOOKS_CHANNEL_ENABLD=true
TOP_CHANNEL_ENABLED=true
TRAINING_CHANNEL_ENABLED=true

GUILD_CATEGORY_LESSONS_ID=""

GUILD_ADMIN_ROLE_ID=""

MAX_ACTIVE_LESSONS=2
```