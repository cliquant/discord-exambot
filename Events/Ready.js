const { ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { createStartEmbed, usersWhoCurrentlyTraining, createBooksEmbed, createTopEmbed, explainBotEmbed } = require("../Functions/embeds");
const { GUILD_BOOKS_CHANNEL_ID, GUILD_TRAIN_CHANNEL_ID, GUILD_TOP_CHANNEL_ID, GUILD_START_CHANNEL_ID, START_CHANNEL_ENABLED, BOOKS_CHANNEL_ENABLD, TOP_CHANNEL_ENABLED, TRAINING_CHANNEL_ENABLED } = process.env;

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
        await Database.prepareDatabase().then(async () => {
            await Database.startTimers();
            console.log('[DATABASE] Database is ready.')
            console.log(`[CLIENT] Logged in as ${client.user.tag}.\n`)

            await client.user.setPresence({
                activities: [{ name: "Spotify", type: ActivityType.Listening }]
            });
            setInterval(async () => {
                client.user.setPresence({
                    activities: [{ name: `${await Database.getActiveLessonCount()} active lessons`, type: ActivityType.Watching }]
                });
                setTimeout(async () => {
                    client.user.setPresence({
                    activities: [{ name: "Spotify", type: ActivityType.Listening }]
                    });
                }, 5000);
            }, 5000);

            if (TRAINING_CHANNEL_ENABLED == "true") {
                const channel_train = client.channels.cache.get(GUILD_TRAIN_CHANNEL_ID);
                await channel_train.messages.fetch().then(messages => {
                    channel_train.bulkDelete(messages);
                });
                await channel_train.send(await usersWhoCurrentlyTraining()).then(async message => {
                    setInterval(async () => {
                        await message.edit(await usersWhoCurrentlyTraining());
                    }, 1000);
                });
                await channel_train.send(createStartEmbed());
            }

            if (TOP_CHANNEL_ENABLED == "true") {
                const channel_top = client.channels.cache.get(GUILD_TOP_CHANNEL_ID);
                await channel_top.messages.fetch().then(async messages => {
                    await channel_top.bulkDelete(messages);
                });
                await channel_top.send(await createTopEmbed()).then(message => {
                    setInterval(async () => {
                        await message.edit(await createTopEmbed());
                    }, 1000);
                });
            }

            if (BOOKS_CHANNEL_ENABLD == "true") {
                const channel_books = client.channels.cache.get(GUILD_BOOKS_CHANNEL_ID);
                await channel_books.messages.fetch().then(async messages => {
                    await channel_books.bulkDelete(messages);
                });
                await channel_books.send(createBooksEmbed()).then(async message => {
                    setInterval(async () => {
                        await message.edit(await createBooksEmbed());
                    }, 1000);
                });
            }

            if (START_CHANNEL_ENABLED == "true") {
                const channel_start = client.channels.cache.get(GUILD_START_CHANNEL_ID);
                await channel_start.messages.fetch().then(async messages => {
                    await channel_start.bulkDelete(messages);
                });
    
                await channel_start.send(await explainBotEmbed());
            }
        })
    }
}