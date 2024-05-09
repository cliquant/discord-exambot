const Database = require("../../Functions/database");
const { createQuestionEmbed, createStartLessonEmbed } = require("../../Functions/embeds");

async function LessonSelectMenu(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.values[0].startsWith('select_lesson_')) {
        let lesson = interaction.values[0].split('_')[2];

        interaction.update(createStartLessonEmbed(false));

        let firstId = Database.getLessonFirstQuestionId(lesson);
        let questionEmbed = createQuestionEmbed(lesson, firstId, interaction.user.id, false, false, '');

        await interaction.channel.send(questionEmbed);

        Database.setActiveLessonType(interaction.channel.id, lesson, firstId);
    }
    if (interaction.values[0].startsWith('select_answer_')) {
        let lesson = interaction.values[0].split('_')[2];
        let questionId = interaction.values[0].split('_')[3];
        let selectAnswerId = interaction.values[0].split('_')[4];

        let correct = Database.checkAnswer(lesson, questionId, selectAnswerId);

        await interaction.update(createQuestionEmbed(lesson, questionId, interaction.user.id, true, correct, selectAnswerId));

        Database.addActiveLessonHistoryAnswer(interaction.user.id, interaction.channel.id, lesson, questionId, selectAnswerId, correct)

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
            await interaction.channel.send(createQuestionEmbed(lesson, nextId, interaction.user.id, false, false));		
        }
    }
}

module.exports = {
    LessonSelectMenu
}