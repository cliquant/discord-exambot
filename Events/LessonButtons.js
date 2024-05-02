const { ChannelType, PermissionFlagsBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { createStartLessonEmbed, createSelectLessonMenu } = require("../Functions/embeds");
const { MAX_ACTIVE_LESSONS, GUILD_CATEGORY_LESSONS_ID, GUILD_ADMIN_ROLE_ID } = process.env;

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId === 'end_lesson') {
            const user = interaction.user;
            const userId = user.id;
            const channelId = interaction.channel.id;

            Database.removeActiveLesson(userId, channelId);
            interaction.channel.delete();
        }
        if (interaction.customId === 'start_lesson') {
            const user = interaction.user;
            const userId = user.id;
            const channelId = interaction.channel.id;

            let count = Database.getActiveLessonCount() + 1;

            if (count > MAX_ACTIVE_LESSONS) {
                interaction.reply({ content: 'Pārtrauciet vienu no treniņiem, lai sāktu jaunu.', ephemeral: true });
            } else {
                interaction.deferReply({ ephemeral: true });
                const newChannel = await interaction.guild.channels.create({
                    name: "treniņš-" + count,
                    type: ChannelType.GuildText,
                    parent: GUILD_CATEGORY_LESSONS_ID,
                    permissionOverwrites: [{
                            id: interaction.guild.roles.everyone,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: GUILD_ADMIN_ROLE_ID,
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                }).then(channel => {
                    channel.send(createStartLessonEmbed(true));

                    setTimeout(() => {
                        interaction.editReply({ content: "<#" + channel.id + ">", ephemeral: true })
                    }, 500);
                    Database.addActiveLesson(userId, channel.id);
                });
            }
        }
        
    }
}