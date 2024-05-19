const { embedLength } = require("discord.js");
const Database = require("../../Functions/database");
const Embeds = require("../../Functions/embeds");

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
    if (interaction.customId.startsWith('admin_edit_question_title_')) {
        let lesson = interaction.customId.split('_')[4];
        let questionId = interaction.customId.split('_')[5];

        let title = interaction.fields.getTextInputValue('admin_edit_question_title');

        await Database.renameTrainingQuestionTitle(lesson, questionId, title)

        await interaction.update({ content: `Jautājuma nosaukums veiksmīgi nomainīts!`, components: [], ephemeral: true, embeds: [] });
    }
    if (interaction.customId.startsWith('admin_edit_question_hint_')) {
        let lesson = interaction.customId.split('_')[4];
        let questionId = interaction.customId.split('_')[5];

        let hint = interaction.fields.getTextInputValue('admin_edit_question_hint');
        let price = interaction.fields.getTextInputValue('admin_edit_question_hint_price');
        let enabled = interaction.fields.getTextInputValue('admin_edit_question_hint_enabled');

        const hintJson = {
            enabled: enabled,
            question: hint,
            cost: price
        }

        await Database.editTrainingQuestionHint(lesson, questionId, hintJson)

        await interaction.update({ content: `Jautājuma hint veiksmīgi rediģēts!`, components: [], ephemeral: true, embeds: [] });
    }
    if (interaction.customId.startsWith('admin_add_question_hint_')) {
        let lesson = interaction.customId.split('_')[4];
        let questionId = interaction.customId.split('_')[5];

        let hint = interaction.fields.getTextInputValue('admin_add_question_hint');
        let price = interaction.fields.getTextInputValue('admin_add_question_hint_price');
        let enabled = interaction.fields.getTextInputValue('admin_add_question_hint_enabled');

        const hintJson = {
            enabled: enabled,
            question: hint,
            cost: price
        }

        await Database.editTrainingQuestionHint(lesson, questionId, hintJson)

        await interaction.update({ content: `Jautājuma hint veiksmīgi pievienots!`, components: [], ephemeral: true, embeds: [] });
    }
    if (interaction.customId.startsWith('admin_edit_book_lesson_edittext_')) {
        let lesson = interaction.customId.split('_')[5];
        let topic = interaction.customId.split('_')[6];

        let text = interaction.fields.getTextInputValue('admin_edit_book_lesson_edittext');

        await Database.editBookLessonContent(lesson, topic, text);

        await interaction.update({ content: `Stundas tēmas content veiksmīgi rediģēts!`, components: [], ephemeral: true, embeds: [] });
    }
    if (interaction.customId.startsWith('admin_add_training_question_answer_')) {
        let type = interaction.customId.split('_')[5];
        let lesson = interaction.customId.split('_')[6];
        let questionId = interaction.customId.split('_')[7];

        if (type == "select") {
            let answer = interaction.fields.getTextInputValue('admin_add_training_question_answer');
            let correct = interaction.fields.getTextInputValue('admin_add_training_question_trueorfalse');

            if (answer == null || correct == null) {
                await interaction.reply({ content: `Lūdzu aizpildiet visus laukus!`, components: [], ephemeral: true });
                return;
            }

            if (correct != "true" && correct != "false") {
                await interaction.reply({ content: `Lūdzu aizpildi laukumu pareizi, tev ir jāatbild ar true vai false.`, components: [], ephemeral: true });
                return;
            }

            parseCorrect = correct == "true" ? true : false;

            await Database.addTrainingQuestionAnswerSelect(lesson, questionId, answer, parseCorrect);

            await interaction.update({ content: `Atbilde veiksmīgi pievienota!`, components: [], ephemeral: true, embeds: [] });
        } else {
            let answer = interaction.fields.getTextInputValue('admin_add_training_question_answer');

            if (answer == null) {
                await interaction.reply({ content: `Lūdzu aizpildiet visus laukus!`, components: [], ephemeral: true });
                return;
            }

            await Database.addTrainingQuestionAnswerText(lesson, questionId, answer);

            await interaction.update({ content: `Atbilde veiksmīgi pievienota!`, components: [], ephemeral: true, embeds: [] });
        }
    }
}

module.exports = {
    AdminModal
}