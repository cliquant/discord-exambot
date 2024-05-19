const Database = require("../../Functions/database");
const { admin_TrainingLessonQuestionAnswersEmbed, admin_renameTrainingLessonModal, admin_editTrainingQuestionModal, admin_confirmDelete, admin_editTrainingQuestionAnswerModal } = require("../../Functions/embeds");

async function AdminButtons(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId.startsWith('admin_edit_training_question_answer_add_select_')) {
        let lessonId = interaction.customId.split('_')[6]
        let questionId = interaction.customId.split('_')[7]
        let type = interaction.customId.split('_')[8]

        await interaction.showModal(await admin_editTrainingQuestionAnswerModal(lessonId, questionId, type));
    }
    if (interaction.customId.startsWith('admin_edit_lesson_rename_')) {
        let lessonId = interaction.customId.split('_')[4]
        
        await interaction.showModal(await admin_renameTrainingLessonModal(lessonId));
    }
    if (interaction.customId.startsWith('cancel_delete_')) {
        await interaction.update({ content: `Atcelta dzēšana!`, ephemeral: true, components: [], embeds: [] });
    }
    if (interaction.customId.startsWith('admin_edit_training_questionanswer_')) {
        let type = interaction.customId.split('_')[4]
        let lesson = interaction.customId.split('_')[5]
        let questionId = interaction.customId.split('_')[6]
        let answerId = interaction.customId.split('_')[7]

        await interaction.showModal(await admin_editTrainingQuestionAnswerModal(lesson, questionId, type, answerId));
    }

    if (interaction.customId.startsWith('admin_delete_training_questionanswer_')) {
        let type = interaction.customId.split('_')[4]
        let lesson = interaction.customId.split('_')[5]
        let questionId = interaction.customId.split('_')[6]
        let answersPage = interaction.customId.split('_')[7]

        if (type == 'select') {
            await interaction.update(await admin_confirmDelete('trainingLessonAnswerSelect', lesson + '-' + questionId + '-' + answersPage))
        } else {
            await interaction.update(await admin_confirmDelete('trainingLessonAnswerText', lesson + '-' + questionId + '-' + answersPage))
        }
    }
    if (interaction.customId.startsWith('confirm_delete_')) {
        let what = interaction.customId.split('_')[2]
        let ID = interaction.customId.split('_')[3]

        if (what == 'trainingLessonAnswerSelect') {
            let lesson = ID.split('-')[0]
            let question = ID.split('-')[1]
            let answer = ID.split('-')[2]

            await Database.deleteTrainingQuestionAnswer(lesson, question, answer, 'select')
            await interaction.update({ content: `Atbilde veiksmīgi dzēsta!`, ephemeral: true, components: [], embeds: [] });
        }

        if (what == 'trainingLessonAnswerText') {
            let lesson = ID.split('-')[0]
            let question = ID.split('-')[1]
            let answer = ID.split('-')[2]

            await Database.deleteTrainingQuestionAnswer(lesson, question, answer, 'text')
            await interaction.update({ content: `Atbilde veiksmīgi dzēsta!`, ephemeral: true, components: [], embeds: [] });
        }

        if (what == 'trainingLesson') {
            let exist = await Database.getLessonsInArray().find(lesson => lesson.id === ID)
            if (!exist) return await interaction.update({ content: `Treniņš ar šādu ID neeksistē!`, ephemeral: true });
            await Database.deleteTrainingLesson(ID)
            await interaction.update({ content: `Treniņš veiksmīgi dzēsts!`, ephemeral: true, components: [], embeds: [] });
        }

        if (what == 'trainingQuestion') {

            let actualLesson = ID.split('-')[0]
            let actualQuestion = ID.split('-')[1]

            let exist = await Database.getLessonQuestionFromId(actualLesson, actualQuestion)
            if (!exist) return await interaction.update({ content: `Jautājums ar šādu ID neeksistē!`, ephemeral: true });
            await Database.deleteTrainingQuestion(actualLesson, actualQuestion)
            await interaction.update({ content: `Jautājums veiksmīgi dzēsts!`, ephemeral: true, components: [], embeds: [] });
        }
    }
    if (interaction.customId.startsWith('admin_select_lesson_')) {
        let lessonId = interaction.customId.split('_')[3]
        let forWhat = interaction.customId.split('_')[4]
        let forWhat2 = forWhat.split('-')[1].replace('(', '').replace(')', '')

        if (forWhat2 == 'trainingQuestion_') {
            await Database.deleteTrainingLesson(lessonId)
            await interaction.reply({ content: `Treniņš veiksmīgi dzēsts!`, ephemeral: true });
        }
    } 
    if (interaction.customId.startsWith('admin_edit_question_answers_')) {
        const type = interaction.customId.split('_')[4];
        const lessonId = interaction.customId.split('_')[5]
        const questionId = interaction.customId.split('_')[6]

        await interaction.showModal(await admin_editTrainingQuestionModal(type, lessonId, questionId));
    }
    if (interaction.customId.startsWith('admin_edit_training_question_answer_select_')) {
        const lessonId = interaction.customId.split('_')[6]
        const questionId = interaction.customId.split('_')[7]
        const pageNumber = interaction.customId.split('_')[8]

        await interaction.update(await admin_TrainingLessonQuestionAnswersEmbed(lessonId, questionId, pageNumber))
    }
}

module.exports = {
    AdminButtons
}