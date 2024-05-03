const { ChannelType, PermissionFlagsBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { createStartLessonEmbed, myProfileEmbed, createSelectLessonMenu } = require("../Functions/embeds");
const { MAX_ACTIVE_LESSONS, GUILD_CATEGORY_LESSONS_ID, GUILD_ADMIN_ROLE_ID } = process.env;

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId === 'my_profile') {
            interaction.reply(myProfileEmbed(interaction.user));
        }
    }
}