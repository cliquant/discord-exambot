const { ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { createStartEmbed } = require("../Functions/embeds");
const { GUILD_START_CHANNEL_ID } = process.env;

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

            // get channel by id GUILD_START_CHANNEL_ID
            const channel = client.channels.cache.get(GUILD_START_CHANNEL_ID);
            // clear messages
            await channel.messages.fetch().then(messages => {
                channel.bulkDelete(messages);
            });

            await channel.send(createStartEmbed());
        })
    }
}