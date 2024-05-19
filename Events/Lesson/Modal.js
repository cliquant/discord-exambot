const Database = require("../../Functions/database");
const { lessonFinishedEmbed, createQuestionEmbed, createAnswerModal } = require("../../Functions/embeds");

async function LessonModal(interaction) {
    if (interaction.customId != null)
		if (interaction.customId.startsWith('answer_question_')) {
			const lesson = interaction.customId.split('_')[3];
			const questionId = interaction.customId.split('_')[2];

			await interaction.showModal(await createAnswerModal(lesson, questionId, interaction.message.id));
		}
        if (!interaction.isModalSubmit()) return;
		if (interaction.customId.startsWith('answer_modal_')) {
			const lesson = interaction.customId.split('_')[3];
			const questionId = interaction.customId.split('_')[2];
			const messageId = interaction.customId.split('_')[4];

			let answer = interaction.fields.getTextInputValue('answer_to_question');

			let correct = await Database.checkAnswer(lesson, questionId, answer);

			await Database.addActiveLessonHistoryAnswer(interaction.user.id, interaction.channel.id, lesson, questionId, answer, correct)

			await interaction.update(await createQuestionEmbed(lesson, questionId, interaction.user.id, true, correct, answer))

			let nextId = await Database.getLessonNextQuestionId(interaction.user.id, interaction.channel.id, lesson, questionId);

			if (nextId === 'there_is_no_more_questions') {
				await interaction.channel.send(await lessonFinishedEmbed(interaction.user.id, interaction.channel.id))
                await interaction.channel.send({ content: `*Šis channel tiks izdzēsts pēc 1 minutes automātiski*` })
                await Database.addUserCoins(interaction.user.id, await Database.getActiveLessonRewardCountTotal(interaction.user.id, interaction.channel.id))
				await Database.addToUserLessonPoints(interaction.user.id, lesson, await Database.getActiveLessonRewardCountTotal(interaction.user.id, interaction.channel.id))
                await Database.setStopTimeForActiveLesson(interaction.channel.id)
                await Database.addToUserHistoryALesson(interaction.user.id, await Database.getActiveLessonByChannel(interaction.channel.id))
                await Database.deleteActiveLesson(interaction.channel.id);
                setTimeout(async () => {
					if (interaction.channel != null) {
						await interaction.channel.delete();
					}
                }, 60000);
			} else {
				await interaction.channel.send(await createQuestionEmbed(lesson, nextId, interaction.user.id, false, false, ''));		
			}
		}
}

module.exports = {
    LessonModal
}