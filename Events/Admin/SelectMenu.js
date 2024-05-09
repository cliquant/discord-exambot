const { admin_confirmDelete, admin_editTrainingLessonEmbed, admin_chooseQuestionEmbed, admin_editTrainingQuestionEmbed } = require("../../Functions/embeds");

async function AdminSelectMenu(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.values[0].startsWith('admin_select_lesson_')) {
        let lessonId = interaction.values[0].split('_')[3]
        let forWhat = interaction.values[0].split('_')[4]
        let forWhat1 = forWhat.split('-')[0].replace('(', '').replace(')', '')
        let forWhat2 = forWhat.split('-')[1].replace('(', '').replace(')', '')

        console.log(forWhat1, forWhat2)
        if (forWhat1 == 'trainingLesson') {
            if (forWhat2 == 'delete') {
                await interaction.update(admin_confirmDelete("trainingLesson", lessonId))
            }
            if (forWhat2 == 'edit') {
                await interaction.update(admin_editTrainingLessonEmbed("choose", lessonId))
            }
        }
        if (forWhat1 == 'trainingQuestion') {
            if (forWhat2 == 'delete') {
                await interaction.update(admin_chooseQuestionEmbed("trainingQuestion-delete", lessonId))
            }
            if (forWhat2 == 'edit') {
                await interaction.update(admin_chooseQuestionEmbed("trainingQuestion-edit", lessonId))
            }
        }
    } 
    if (interaction.values[0].startsWith('admin_select_question_')) {
        let lessonId = interaction.values[0].split('_')[3]
        let questionId = interaction.values[0].split('_')[4]
        let forWhat = interaction.values[0].split('_')[5]
        let forWhat1 = forWhat.split('-')[0].replace('(', '').replace(')', '')
        let forWhat2 = forWhat.split('-')[1].replace('(', '').replace(')', '')

        if (forWhat1 == 'trainingQuestion') {
            if (forWhat2 == 'delete') {
                await interaction.update(admin_confirmDelete("trainingQuestion", lessonId + "-" + questionId))
            }
            if (forWhat2 == 'edit') {
                await interaction.update(admin_editTrainingQuestionEmbed("choose", lessonId, questionId))
            }
        }
    }
}

module.exports = {
    AdminSelectMenu
}