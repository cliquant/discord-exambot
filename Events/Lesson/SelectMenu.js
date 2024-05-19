const Database = require("../../Functions/database");
const { createQuestionEmbed, createStartLessonEmbed } = require("../../Functions/embeds");

async function LessonSelectMenu(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.values[0].startsWith('select_lesson_')) {
        let lesson = interaction.values[0].split('_')[2];

        await interaction.update(await createStartLessonEmbed(false));

        let firstId = await Database.getLessonFirstQuestionId(lesson);
        if (firstId === 'there_is_no_questions') {
            await interaction.channel.send({ content: `Administrācīja šobrīd šim treniņam nav pievienojusi nevienu jautājumu.` })
            return;
        }

        let questionEmbed = await createQuestionEmbed(lesson, firstId, interaction.user.id, false, false, '');

        await interaction.channel.send(questionEmbed);

        await Database.setActiveLessonType(interaction.channel.id, lesson, firstId);
    }
    if (interaction.values[0].startsWith('select_answer_')) {
        let lesson = interaction.values[0].split('_')[2];
        let questionId = interaction.values[0].split('_')[3];
        let selectAnswerId = interaction.values[0].split('_')[4];

        let correct = await Database.checkAnswer(lesson, questionId, selectAnswerId);

        await interaction.update(await createQuestionEmbed(lesson, questionId, interaction.user.id, true, correct, selectAnswerId));

        await await Database.addActiveLessonHistoryAnswer(interaction.user.id, interaction.channel.id, lesson, questionId, selectAnswerId, correct)

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
                await interaction.channel.delete();
            }, 60000);
        } else {
            await interaction.channel.send(await createQuestionEmbed(lesson, nextId, interaction.user.id, false, false));		
        }
    }
}

module.exports = {
    LessonSelectMenu
}