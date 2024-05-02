const { ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { createStartEmbed, createTopEmbed } = require("../Functions/embeds");
const { GUILD_START_CHANNEL_ID, GUILD_TOP_CHANNEL_ID } = process.env;

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
        Database.prepareDatabase().then(async () => {
            console.log('[DATABASE] Database is ready.')
            console.log(`[CLIENT] Logged in as ${client.user.tag}.\n`)

            client.user.setPresence({
                activities: [{ name: "Spotify", type: ActivityType.Listening }]
            });
            setInterval(async () => {
                client.user.setPresence({
                    activities: [{ name: `${Database.getActiveLessonCount()} active lessons`, type: ActivityType.Watching }]
                });
                setTimeout(async () => {
                    client.user.setPresence({
                    activities: [{ name: "Spotify", type: ActivityType.Listening }]
                    });
                }, 5000);
            }, 5000);

            const channel_start = client.channels.cache.get(GUILD_START_CHANNEL_ID);
            await channel_start.messages.fetch().then(messages => {
                channel_start.bulkDelete(messages);
            });
            await channel_start.send(createStartEmbed());

            const channel_top = client.channels.cache.get(GUILD_TOP_CHANNEL_ID);
            await channel_top.messages.fetch().then(messages => {
                channel_top.bulkDelete(messages);
            });
            await channel_top.send(createTopEmbed()).then(message => {
                setInterval(() => {
                    message.edit(createTopEmbed());
                }, 1000);
            });
        })
    }
}