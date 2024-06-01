[![EXAMBOT](https://i.imgur.com/aPjk6vT.png)](https://github.com/cliquant)

> [!NOTE]
> The bot was created for the JPTC challenge, for my own experience and to help students prepare for their exams. ( The bot is in latvian for now - I haven't finished language system. )

[Test Server](https://discord.gg/EMzXFQZq) ( Bot is online till JPTC challange end. )

## Setup:

- Download NodeJS and NPM from [nodejs.org](https://nodejs.org/en)
- Download the project or clone it using `git clone https://github.com/cliquant/discord-exambot`
- Open IDE or terminal in the project folder and enter in terminal `npm i` ( make sure you have package.json file )
- Rename `.env.example` to `.env`
- Open `.env` and enter your bot/guild details. ( In the file everything is commented )
- Run bot using `node index.js`

You can create your bot and get token at: [Discord Applications](https://discord.com/developers/applications)

## Commands:

```
USER:
/help - Explains how the bot works.
/profile - View your profile/progress.
/top - With this command you can see the top users ( you can get points by doing training ).
/books - With this command it is possible to read ( a book ) about a specific topic.
/train - With this command it is possible to start a training to test your knowledge.
/stop - With this command it is possible to stop a training.
/active - With this command it is possible to see who is currently training.

ADMIN:
/training - Edit all about trainings ( questions, answers )
/books - Edit all about books ( topics, pages )
```

## Channels:

You're able to disable/enable them in .env if you want only commands based all.

## .env

```
AUTHOR="CLIQUANT"

DISCORD_BOT_TOKEN="" # bot token
DISCORD_BOT_ID="" # bot id

DISCORD_GUILD_ID="" # guild id

GUILD_TRAIN_CHANNEL_ID="" # channel where user can train 
GUILD_TOP_CHANNEL_ID="" # channel where user can see user top
GUILD_BOOKS_CHANNEL_ID="" # channel where user can see books
GUILD_START_CHANNEL_ID="" # channel where user can start the lesson

START_CHANNEL_ENABLED=true # if false, bot will not create start channel ( user will be able still to start throuh command )
BOOKS_CHANNEL_ENABLD=true # if false, bot will not create books channel ( user will be able still to look it throuh command )
TOP_CHANNEL_ENABLED=true # if false, bot will not create top channel ( user will be able still to look it throuh command )
TRAINING_CHANNEL_ENABLED=true # if false, bot will not create training channels ( user will be able still to train throuh command )

GUILD_CATEGORY_LESSONS_ID="" # category id

GUILD_ADMIN_ROLE_ID="" # admin role id
 
MAX_ACTIVE_LESSONS=2 # How much active lessons user can have at the same time
```

## Preview

[![EXAMBOT](https://i.imgur.com/20sa9ij.png)](https://github.com/cliquant)

[![EXAMBOT](https://i.imgur.com/GDuvIeo.png)](https://github.com/cliquant)

[![EXAMBOT](https://i.imgur.com/hBsSL35.png)](https://github.com/cliquant)

[![EXAMBOT](https://i.imgur.com/J62YPqM.png)](https://github.com/cliquant)

[![EXAMBOT](https://i.imgur.com/UBU85c6.png)](https://github.com/cliquant)

[![EXAMBOT](https://i.imgur.com/Z4ZbGsA.png)](https://github.com/cliquant)
