const Database = require("../../Functions/database");

async function AdminModal(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId.startsWith('admin_add_question_')) {
        const lessonId = interaction.customId.split('_')[3];
        const question = interaction.fields.getTextInputValue('admin_add_question_question');
        const answer = interaction.fields.getTextInputValue('admin_add_question_answer');
        const type = interaction.fields.getTextInputValue('admin_add_question_type');
        const image = interaction.fields.getTextInputValue('admin_add_question_image');

        if (image != null || image != 'none') {
            if (!image.startsWith('http')) {
                await interaction.reply({ content: `Attēla URL jāsākas ar "http" vai "https"!`, components: [], ephemeral: true });
                return;
            }
        }

        if (question == null || answer == null || type == null) {
            await interaction.reply({ content: `Lūdzu aizpildiet visus laukus!`, components: [], ephemeral: true });
            return;
        }

        const lesson = await Database.getTrainingLessonById(lessonId);
        if (lesson == null) {
            await interaction.reply({ content: `Šis treniņa ID neeksistē!`, components: [], ephemeral: true });
            return;
        }

        await Database.addTrainingQuestion(lessonId, question, answer, type, image);

        await interaction.update({ content: `Jautājums veiksmīgi pievienots!`, components: [], ephemeral: true });
    }
    if (interaction.customId.startsWith('admin_edit_lesson_rename_')) {
        const lessonId = interaction.customId.split('_')[4];
        const titleInput = interaction.fields.getTextInputValue('admin_edit_lesson_rename_title');

        if (titleInput == null) {
            await interaction.reply({ content: `Lūdzu aizpildiet visus laukus!`, components: [], ephemeral: true });
            return;
        }

        const lesson = await Database.getTrainingLessonById(lessonId);
        if (lesson == null) {
            await interaction.reply({ content: `Šis treniņa ID neeksistē!`, components: [], ephemeral: true });
            return;
        }

        await Database.renameTrainingLessonTitle(lessonId, titleInput);

        await interaction.update({ content: `Treniņa nosaukums veiksmīgi nomainīts!`, components: [], ephemeral: true });
    }
    if (interaction.customId.startsWith('add_training_lesson_')) {
        const titleInput = interaction.fields.getTextInputValue('add_training_lesson_title');
        const typeInput = interaction.fields.getTextInputValue('add_training_lesson_type');
        const idInput = interaction.fields.getTextInputValue('add_training_lesson_id');

        if (titleInput == null || typeInput == null || idInput == null) {
            await interaction.reply({ content: `Lūdzu aizpildiet visus laukus!`, components: [], ephemeral: true });
            return;
        }

        if (typeInput != 'text' && typeInput != 'select') {
            await interaction.reply({ content: `Treniņa tips var būt tikai "text" vai "select"!`, components: [], ephemeral: true });
            return;
        }

        const lesson = await Database.getTrainingLessonById(idInput);
        if (lesson != null) {
            await interaction.reply({ content: `Šis treniņa ID jau eksistē!`, components: [], ephemeral: true });
            return;
        }
        
        await Database.addTrainingLesson(titleInput, typeInput, idInput);

        await interaction.reply({ content: `Treniņš veiksmīgi pievienots!`, components: [], ephemeral: true });
    }
    if (interaction.customId.startsWith('edit_training_question_answer_')) {
        let lesson = interaction.customId.split('_')[4];
        let questionId = interaction.customId.split('_')[5];
        let answerId = interaction.customId.split('_')[6];
        let type = interaction.customId.split('_')[7];

        const answer = interaction.fields.getTextInputValue('edit_training_question_answer');

        if (answer == null) {
            await interaction.reply({ content: `Lūdzu aizpildiet visus laukus!`, components: [], ephemeral: true });
            return;
        }

        await Database.editTrainingQuestionAnswer(lesson, questionId, answerId, answer, type);
        await interaction.update({ content: `Atbilde veiksmīgi nomainīta!`, components: [], ephemeral: true, embeds: [] });
    }
}

module.exports = {
    AdminModal
}