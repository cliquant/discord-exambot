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
			const lesson = interaction.customId.split('_')[3];
			const questionId = interaction.customId.split('_')[2];

			interaction.showModal(createAnswerModal(lesson, questionId, interaction.message.id));
		}
        if (!interaction.isModalSubmit()) return;
		if (interaction.customId.startsWith('answer_modal_')) {
			const lesson = interaction.customId.split('_')[3];
			const questionId = interaction.customId.split('_')[2];
			const messageId = interaction.customId.split('_')[4];

			let answer = interaction.fields.getTextInputValue('answer_to_question');

			let correct = Database.checkAnswer(lesson, questionId, answer);

			Database.addActiveLessonHistoryAnswer(interaction.user.id, interaction.channel.id, lesson, questionId, answer, correct)

			await interaction.update(createQuestionEmbed(lesson, questionId, interaction.user.id, true, correct, answer))

			let nextId = Database.getLessonNextQuestionId(interaction.user.id, interaction.channel.id, lesson, questionId);

			if (nextId === 'there_is_no_more_questions') {
				await interaction.channel.send(lessonFinishedEmbed(interaction.user.id, interaction.channel.id))
                await interaction.channel.send({ content: `*Šis channel tiks izdzēsts pēc 1 minutes automātiski*` })
                Database.addUserCoins(interaction.user.id, Database.getActiveLessonRewardCountTotal(interaction.user.id, interaction.channel.id))
				Database.addToUserLessonPoints(interaction.user.id, lesson, Database.getActiveLessonRewardCountTotal(interaction.user.id, interaction.channel.id))
                Database.setStopTimeForActiveLesson(interaction.channel.id)
                Database.addToUserHistoryALesson(interaction.user.id, Database.getActiveLessonByChannel(interaction.channel.id))
                Database.deleteActiveLesson(interaction.channel.id);
                setTimeout(() => {
                    interaction.channel.delete();
                }, 60000);
			} else {
				await interaction.channel.send(createQuestionEmbed(lesson, nextId, interaction.user.id, false, false, ''));		
			}
		}
    }
}