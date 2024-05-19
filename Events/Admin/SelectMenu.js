const Database = require("../../Functions/database");
const { admin_editBookLessonEmbed, admin_editBookTopicEmbed, admin_CreateQuestionModal, admin_confirmDelete, admin_editTrainingLessonEmbed, admin_chooseQuestionEmbed, admin_editTrainingQuestionEmbed } = require("../../Functions/embeds");

async function AdminSelectMenu(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.values[0].startsWith('admin_select_book1_lesson_')) {
        let topic = interaction.values[0].split('_')[4]
        let lesson = interaction.values[0].split('_')[5]

        await interaction.update(await admin_editBookLessonEmbed(topic, lesson))
    }
    if (interaction.values[0].startsWith('admin_select_lesson_')) {
        let lessonId = interaction.values[0].split('_')[3]
        let forWhat = interaction.values[0].split('_')[4]
        let forWhat1 = forWhat.split('-')[0].replace('(', '').replace(')', '')
        let forWhat2 = forWhat.split('-')[1].replace('(', '').replace(')', '')

        if (forWhat1 == 'trainingLesson') {
            if (forWhat2 == 'delete') {
                await interaction.update(await admin_confirmDelete("trainingLesson", lessonId))
            }
            if (forWhat2 == 'edit') {
                await interaction.update(await admin_editTrainingLessonEmbed("select", lessonId))
            }
        }
        if (forWhat1 == 'trainingQuestion') {
            if (forWhat2 == 'delete') {
                await interaction.update(await admin_chooseQuestionEmbed("trainingQuestion-delete", lessonId))
            }
            if (forWhat2 == 'edit') {
                await interaction.update(await admin_chooseQuestionEmbed("trainingQuestion-edit", lessonId))
            }
            if (forWhat2 == 'add') {
                await interaction.showModal(await admin_CreateQuestionModal())
            }
        }
    } 
    if (interaction.values[0].startsWith('admin_select_book_lesson_')) {
        let lessonId = interaction.values[0].split('_')[4]
        let forWhat = interaction.values[0].split('_')[5]
        let forWhat2 = forWhat.split('-')[0].replace('(', '').replace(')', '')
        let forWhat3 = forWhat.split('-')[1].replace('(', '').replace(')', '')

        if (forWhat2 == 'bookTopic') {
            if (forWhat3 == 'delete') {
                await interaction.update(await admin_confirmDelete('bookTopic', lessonId))
            }
            if (forWhat3 == 'edit') {
                await interaction.update(await admin_editBookTopicEmbed(lessonId))
            }
        }
    }
    if (interaction.values[0].startsWith('admin_edit_question_select_')) {
        let type = interaction.values[0].split('_')[4]
        let lessonId = interaction.values[0].split('_')[5]
        let questionId = interaction.values[0].split('_')[6]

        await Database.changeTypeOfQuestion(lessonId, questionId, type)
        await interaction.update({ content: 'Jautājuma tips tika nomainīts uz ' + type, components: [], embeds: [], ephemeral: true })
    }
    if (interaction.values[0].startsWith('admin_select_question_')) {
        let lessonId = interaction.values[0].split('_')[3]
        let questionId = interaction.values[0].split('_')[4]
        let forWhat = interaction.values[0].split('_')[5]
        let forWhat1 = forWhat.split('-')[0].replace('(', '').replace(')', '')
        let forWhat2 = forWhat.split('-')[1].replace('(', '').replace(')', '')

        if (forWhat1 == 'trainingQuestion') {
            if (forWhat2 == 'delete') {
                await interaction.update(await admin_confirmDelete("trainingQuestion", lessonId + "-" + questionId))
            }
            if (forWhat2 == 'edit') {
                await interaction.update(await admin_editTrainingQuestionEmbed("select", lessonId, questionId))
            }

        }
    }
    if (interaction.values[0].startsWith('admin_edit_trainingquestion_answer_trueorfalse_')) {
        let lessonId = interaction.values[0].split('_')[5]
        let questionId = interaction.values[0].split('_')[6]
        let answerId = interaction.values[0].split('_')[7]
        let answer = interaction.values[0].split('_')[8]


        await Database.changeAnswerTrueOrFalse(lessonId, questionId, answerId, answer)
        await interaction.update({ content: 'Atbilde tika nomainīta uz ' + answer, components: [], embeds: [], ephemeral: true })
    }
}

module.exports = {
    AdminSelectMenu
}