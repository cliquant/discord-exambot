const { ChannelType, PermissionFlagsBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { myProfileHistoryEmbedChoose, myProfileHistoryLesson, myProfileEmbed, createSelectLessonMenu } = require("../Functions/embeds");
const { MAX_ACTIVE_LESSONS, GUILD_CATEGORY_LESSONS_ID, GUILD_ADMIN_ROLE_ID } = process.env;

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId.startsWith('my_profile_history_')) {
            let lesson = interaction.customId.split('_')[3];
            let page = interaction.customId.split('_')[4];

            await interaction.update(myProfileHistoryLesson(interaction.user.id, lesson, page));
        }
        if (interaction.customId === 'my_profile') {
            await interaction.reply(myProfileEmbed(interaction.user));
        }
        if (interaction.customId === 'my_profile_2') {
            await interaction.update(myProfileEmbed(interaction.user));
        }
        if (interaction.customId === 'my_profile_history') {
            await interaction.update(myProfileHistoryEmbedChoose(interaction.user));
        }
    }
}