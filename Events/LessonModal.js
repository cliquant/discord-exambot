const { ChannelType, PermissionFlagsBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { createAnswerModal } = require("../Functions/embeds");
const { MAX_ACTIVE_LESSONS, GUILD_CATEGORY_LESSONS_ID, GUILD_ADMIN_ROLE_ID } = process.env;

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
		if (interaction.customId.includes('answer_question_')) {
			const lesson = interaction.customId.split('_')[3];
			const questionId = interaction.customId.split('_')[2];

			interaction.showModal(createAnswerModal(lesson, questionId));
		}
        if (!interaction.isModalSubmit()) return;
    }
}