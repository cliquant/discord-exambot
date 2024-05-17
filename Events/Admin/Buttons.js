const Database = require("../../Functions/database");
const { admin_TrainingLessonQuestionAnswersEmbed, admin_renameTrainingLessonModal, admin_editTrainingQuestionModal } = require("../../Functions/embeds");

async function AdminButtons(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId.startsWith('admin_edit_lesson_rename_')) {
        let lessonId = interaction.customId.split('_')[4]
        
        await interaction.showModal(admin_renameTrainingLessonModal(lessonId));
    }
    if (interaction.customId.startsWith('cancel_delete_')) {
        await interaction.update({ content: `Atcelta dzēšana!`, ephemeral: true, components: [], embeds: [] });
    }
    if (interaction.customId.startsWith('confirm_delete_')) {
        let what = interaction.customId.split('_')[2]
        let ID = interaction.customId.split('_')[3]

        if (what == 'trainingLesson') {
            let exist = Database.getLessonsInArray().find(lesson => lesson.id === ID)
            if (!exist) return await interaction.update({ content: `Treniņš ar šādu ID neeksistē!`, ephemeral: true });
            Database.deleteTrainingLesson(ID)
            await interaction.update({ content: `Treniņš veiksmīgi dzēsts!`, ephemeral: true, components: [], embeds: [] });
        }

        if (what == 'trainingQuestion') {

            let actualLesson = ID.split('-')[0]
            let actualQuestion = ID.split('-')[1]

            let exist = Database.getLessonQuestionFromId(actualLesson, actualQuestion)
            if (!exist) return await interaction.update({ content: `Jautājums ar šādu ID neeksistē!`, ephemeral: true });
            Database.deleteTrainingQuestion(actualLesson, actualQuestion)
            await interaction.update({ content: `Jautājums veiksmīgi dzēsts!`, ephemeral: true, components: [], embeds: [] });
        }
    }
    if (interaction.customId.startsWith('admin_select_lesson_')) {
        let lessonId = interaction.customId.split('_')[3]
        let forWhat = interaction.customId.split('_')[4]
        let forWhat2 = forWhat.split('-')[1].replace('(', '').replace(')', '')

        if (forWhat2 == 'trainingQuestion_') {
            Database.deleteTrainingLesson(lessonId)
            await interaction.reply({ content: `Treniņš veiksmīgi dzēsts!`, ephemeral: true });
        }
    } 
    if (interaction.customId.startsWith('admin_edit_question_answers_')) {
        const type = interaction.customId.split('_')[4];
        const lessonId = interaction.customId.split('_')[5]
        const questionId = interaction.customId.split('_')[6]

        await interaction.showModal(admin_editTrainingQuestionModal(type, lessonId, questionId));
    }
    if (interaction.customId.startsWith('admin_edit_training_question_answer_select_')) {
        console.log(interaction.customId)
        const lessonId = interaction.customId.split('_')[6]
        const questionId = interaction.customId.split('_')[7]

        await interaction.update(admin_TrainingLessonQuestionAnswersEmbed(lessonId, questionId, 1))
    }
}

module.exports = {
    AdminButtons
}