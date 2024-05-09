const Database = require("../../Functions/database");

async function AdminModal(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId.startsWith('admin_edit_lesson_rename_')) {
        const lessonId = interaction.customId.split('_')[4];
        const titleInput = interaction.fields.getTextInputValue('admin_edit_lesson_rename_title');

        if (titleInput == null) {
            await interaction.reply({ content: `Lūdzu aizpildiet visus laukus!`, components: [], ephemeral: true });
            return;
        }

        const lesson = Database.getTrainingLessonById(lessonId);
        if (lesson == null) {
            await interaction.reply({ content: `Šis treniņa ID neeksistē!`, components: [], ephemeral: true });
            return;
        }

        Database.renameTrainingLessonTitle(lessonId, titleInput);

        await interaction.reply({ content: `Treniņa nosaukums veiksmīgi nomainīts!`, components: [], ephemeral: true });
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

        const lesson = Database.getTrainingLessonById(idInput);
        if (lesson != null) {
            await interaction.reply({ content: `Šis treniņa ID jau eksistē!`, components: [], ephemeral: true });
            return;
        }
        
        Database.addTrainingLesson(titleInput, typeInput, idInput);

        await interaction.reply({ content: `Treniņš veiksmīgi pievienots!`, components: [], ephemeral: true });
    }
}

module.exports = {
    AdminModal
}