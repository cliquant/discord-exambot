const { ChannelType, PermissionFlagsBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { lessonFinishedEmbed, createQuestionEmbed, createAnswerModal } = require("../Functions/embeds");
const { MAX_ACTIVE_LESSONS, GUILD_CATEGORY_LESSONS_ID, GUILD_ADMIN_ROLE_ID } = process.env;

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
		if (interaction.customId != null)
		if (interaction.customId.startsWith('answer_question_')) {

		}
        if (!interaction.isModalSubmit()) return;
		if (interaction.customId.startsWith('answer_modal_')) {
            
		}
    }
}