const Database = require("../../Functions/database");
const { admin_addBookTopic, admin_editBookLessonModal, admin_renameBookTopicModal, trainingQuestionHintModa, admin_TrainingLessonQuestionAnswersEmbed, admin_renameTrainingLessonModal, admin_addTrainingQuestionAnswerModal, admin_confirmDelete, admin_editTrainingQuestionAnswerModal, renameTrainingQuestionTitle } = require("../../Functions/embeds");

async function AdminButtons(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId.startsWith('admin_edit_question_rename_')) {
        let lesson = interaction.customId.split('_')[4]
        let questionId = interaction.customId.split('_')[5]

        await interaction.showModal(await renameTrainingQuestionTitle(lesson, questionId));
    }
    if (interaction.customId.startsWith('admin_edit_question_hint_')) {
        let lesson = interaction.customId.split('_')[4]
        let questionId = interaction.customId.split('_')[5]

        await interaction.showModal(await trainingQuestionHintModa(lesson, questionId));
    }
    if (interaction.customId.startsWith('admin_edit_book_lesson_rename_')) {
        let lesson = interaction.customId.split('_')[5]
        let topic = interaction.customId.split('_')[6]

        await interaction.showModal(await admin_renameBookTopicModal(lesson, topic));
    }
    if (interaction.customId.startsWith('admin_edit_book_lesson_edittext_')) {
        let lesson = interaction.customId.split('_')[5]
        let topic = interaction.customId.split('_')[6]
        
        await interaction.showModal(await admin_editBookLessonModal(topic, lesson));
    }
    if (interaction.customId.startsWith('admin_add_book_topicc_')) {
        let lesson = interaction.customId.split('_')[4]

        await interaction.showModal(await admin_addBookTopic(lesson));
    }
    if (interaction.customId.startsWith('admin_select_book_lesson_')) {
        let lessonId = interaction.customId.split('_')[4]
        let forWhat = interaction.customId.split('_')[5]
        let forWhat2 = forWhat.split('-')[0].replace('(', '').replace(')', '')
        let forWhat3 = forWhat.split('-')[1].replace('(', '').replace(')', '')

        if (forWhat2 == 'bookTopic') {
            if (forWhat3 == 'edit') {
                await interaction.showModal(await admin_renameBookTopicModal(lessonId));
            }
        }
    }
    if (interaction.customId.startsWith('admin_edit_training_question_answer_add_')) {
        let type = interaction.customId.split('_')[6]
        let lesson = interaction.customId.split('_')[7]
        let questionId = interaction.customId.split('_')[8]

        await interaction.showModal(await admin_addTrainingQuestionAnswerModal(type, lesson, questionId));
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
    if (interaction.customId.startsWith('admin_edit_book_topic_rename_')) {
        let lesson = interaction.customId.split('_')[5]

        await interaction.showModal(await admin_renameBookTopicModal(lesson));
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

        if (what == 'bookTopic') {
            let exist = await Database.getBookLessonsIdsInArray()

            exist = exist.find(lesson => {
                return lesson == ID
            })
            if (!exist) return await interaction.update({ content: `Tēma ar šādu ID neeksistē!`, ephemeral: true, embeds: [], components: [] });
            await Database.deleteBookTopic(ID)
            await interaction.update({ content: `Tēma veiksmīgi dzēsta!`, ephemeral: true, components: [], embeds: [] });
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