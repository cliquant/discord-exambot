const { ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, messageLink} = require("discord.js");
const { getTop5Users, getLessonsInArray, getTitleFromLessonId } = require("../database");
const Database = require("../database");
const { GUILD_BOOKS_CHANNEL_ID, GUILD_TRAIN_CHANNEL_ID, GUILD_TOP_CHANNEL_ID, GUILD_START_CHANNEL_ID, START_CHANNEL_ENABLED, BOOKS_CHANNEL_ENABLD, TOP_CHANNEL_ENABLED, TRAINING_CHANNEL_ENABLED } = process.env;


function admin_confirmDelete(what, id) {
    const button = new ButtonBuilder()
        .setCustomId('confirm_delete_' + what + '_' + id)
        .setLabel('Dzēst')
        .setStyle(ButtonStyle.Danger);

    const button2 = new ButtonBuilder()
        .setCustomId('cancel_delete_' + what + '_' + id)
        .setLabel('Atcelt')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(button, button2);

    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Dzēst')
        .setDescription("Vai esi pārliecināts, ka vēlies dzēst?")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

    return {
        components: [row],
        embeds: [topEmbed],
        ephemeral: true
    };
}

async function admin_CreateQuestionModal(lesson) {
    const modal = new ModalBuilder()
        .setTitle('Pievienot jautājumu')
        .setCustomId('admin_add_question_' + lesson + '_training');

    const titleInput = new TextInputBuilder()
        .setCustomId('admin_add_question_title')
        .setLabel('Jautājums')
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

    const imageInput = new TextInputBuilder()
        .setCustomId('admin_add_question_image')
        .setLabel('Attēls ( link, ja nav ieliec none )')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const typeInput = new TextInputBuilder()
        .setCustomId('admin_add_question_type')
        .setLabel('Atbildes tips ( select/text )')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(imageInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(typeInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    return modal;
}

async function admin_chooseQuestionEmbed(forWhat, lesson) {
    const questions = await Database.getLessonQuestions(lesson);

    const options = await Promise.all(questions.map(async (question) => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(question.id)
            .setValue("admin_select_question_" + lesson + "_" + question.id + "_" + forWhat);
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_history_lesson')
        .setPlaceholder('Izvēlies jautājumu')
        .addOptions(options);

    const row2 = new ActionRowBuilder()
        .addComponents(selectMenu);

    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Admin')
        .setDescription("Izvēlies jautājumu.")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

    return {
        components: [row2],
        embeds: [topEmbed],
        ephemeral: true
    };
}

async function admin_ChooseLessonEmbed(forWhat) {
    const lessons = await getLessonsInArray();
    const options = await Promise.all(lessons.map(async (lesson) => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(await getTitleFromLessonId(lesson) + " ( ID: " + lesson + ")")
            .setValue("admin_select_lesson_" + lesson + "_" + forWhat + "");
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_history_lesson')
        .setPlaceholder('Izvēlies mācību')
        .addOptions(options);

    const row2 = new ActionRowBuilder()
        .addComponents(selectMenu);

    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Admin')
        .setDescription("Izvēlies mācību.")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

    return {
        components: [row2],
        embeds: [topEmbed],
        ephemeral: true
    };
}

async function admin_renameTrainingLessonModal(lesson) {
    const modal = new ModalBuilder()
        .setTitle('Pārdēvēt mācību')
        .setCustomId('admin_edit_lesson_rename_' + lesson);

    const titleInput = new TextInputBuilder()
        .setCustomId('admin_edit_lesson_rename_title')
        .setLabel('Nosaukums')
        .setValue(await getTitleFromLessonId(lesson))
        .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);

    modal.addComponents(firstActionRow);

    return modal;
}

async function admin_TrainingLessonQuestionAnswersEmbed(lesson, questionId, page) {
    const question = await Database.getQuestionFromId(lesson, questionId);
    const answers = await Database.getTrainingLessonQuestionAnswers(lesson, questionId);

    const maxPage = answers.length;
    const codePage = parseInt(page) - 1;
    const answersPage = page;

    function doesHaveNextPage() {
        return answers[codePage + 1] ? true : false;
    }

    function doesHavePreviousPage() {
        return answers[codePage - 1] ? true : false;
    }

    const nextPageNumber = parseInt(page) + 1;
    const previousPageNumber = parseInt(page) - 1;

    // ←→

    let topEmbed;
    let row;
    let row2;

    if (maxPage == 0) {
        topEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Atbildes')
            .setDescription("```Nav atbilžu```")
            .setTimestamp()
            .setFooter({ text: 'Eksāmenu palīgs' });
    } else {
        let message = "";
        const answer = answers[codePage];

        message += "> " + question.question + "" + "\n";

        if (question.type == "select") {
            answer1 = Object.keys(answer)[0]
            message += "\n``" + answer1 + "``" + "\n";
        } else {
            message += "\n``" + answer + "``\n";
        }

        topEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Atbildes')
            .setDescription(message)
            .setTimestamp()
            .setFooter({ text: 'Eksāmenu palīgs' });

        const button_backward = new ButtonBuilder()
            .setCustomId('admin_edit_training_question_answer_select_' + lesson + '_' + questionId + '_' + (previousPageNumber))
            .setLabel('←')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(!doesHavePreviousPage());

        let answerid;

        if (question.type == "select") {
            answerid = answer['id'];
        } else {
            answerid = answersPage;
        }

        const deleteAnswer = new ButtonBuilder()
            .setCustomId('admin_delete_training_questionanswer_' + question.type + '_' + lesson + '_' + questionId + '_' + answerid)
            .setLabel('Dzēst')
            .setStyle(ButtonStyle.Danger);

        const button = new ButtonBuilder()
            .setCustomId('admin_edit_training_questionanswer_' + question.type + '_' + lesson + '_' + questionId + '_' + answerid)
            .setLabel('Rediģēt atbildi')
            .setStyle(ButtonStyle.Secondary);
            
        if (question.type == "select") {
            const select = new StringSelectMenuBuilder()
                .setCustomId('admin_edit_question_select')
                .setPlaceholder('Izvēlies atbildi')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Pareiza')
                        .setValue('admin_edit_trainingquestion_answer_trueorfalse_' + lesson + '_' + question.id + '_' + answer[Object.keys(answer)[1]] + '_true')
                        .setDefault(answer[Object.keys(answer)[0]] == true ? true : false),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Nepareiza')
                        .setValue('admin_edit_trainingquestion_answer_trueorfalse_' + lesson + '_' + question.id + '_' + answer[Object.keys(answer)[1]] + '_false')
                        .setDefault(answer[Object.keys(answer)[0]] == false ? true : false),
                );
            
            row2 = new ActionRowBuilder()
                .addComponents(select);
            
        }

        const button_forward = new ButtonBuilder()
            .setCustomId('admin_edit_training_question_answer_select_' + lesson + '_' + questionId + '_' + (nextPageNumber))
            .setLabel('→')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(!doesHaveNextPage());

        row = new ActionRowBuilder()
            .addComponents(button_backward, button, deleteAnswer, button_forward);
    }

    if (maxPage == 0) {
        return {
            embeds: [topEmbed],
            ephemeral: true
        };
    } else {
        if (question.type == "select") {
            return {
                embeds: [topEmbed],
                components: [row, row2],
                ephemeral: true
            };
        } else {
            return {
                components: [row],
                embeds: [topEmbed],
                ephemeral: true
            };
        }
    }

}

async function admin_editTrainingQuestionEmbed(type, lesson, questionId) {
    if (type == "choose") {
        const question = await Database.getQuestionFromId(lesson, questionId);
        const select = new StringSelectMenuBuilder()
            .setCustomId('admin_edit_question_select')
            .setPlaceholder('Izvēlies jautājuma tipu')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Text')
                    .setValue('admin_edit_question_select_text_' + lesson + '_' + question.id)
                    .setDefault(question.type == "text" ? true : false),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Select')
                    .setValue('admin_edit_question_select_select_' + lesson + '_' + question.id)
                    .setDefault(question.type == "select" ? true : false),
            );

        const row2 = new ActionRowBuilder()
            .addComponents(select);

        const button = new ButtonBuilder()
            .setCustomId('admin_edit_question_rename_' + lesson + '_' + question)
            .setLabel('Pārdēvēt')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        const answers = await Database.getTrainingLessonQuestionAnswers(lesson, question.id);


        const disabledButton = answers == null || answers.length == 0;

        const select2 = new ButtonBuilder()
            .setCustomId('admin_edit_training_question_answer_select_' + lesson + '_' + question.id + '_' + 1)
            .setLabel('Skatīt atbildes')
            .setDisabled(disabledButton)
            .setStyle(ButtonStyle.Secondary);

        const select3 = new ButtonBuilder()
            .setCustomId('admin_edit_training_question_answer_add_select_' + lesson + '_' + question.id + '_' + question.type)
            .setLabel('Pievienot atbildi')
            .setStyle(ButtonStyle.Secondary);

        const row3 = new ActionRowBuilder()
            .addComponents(select2, select3);

        const topEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Admin')
            .setDescription("Izvēlies ko vēlies darīt ar jautājumu.\n\n" + "```" + question.question + "```")
            .setTimestamp()
            .setFooter({ text: 'Eksāmenu palīgs' });

        return {
            components: [row, row3, row2],
            embeds: [topEmbed],
            ephemeral: true
        };
    } else {
        const question = await Database.getQuestionFromId(lesson, questionId);
        const select = new StringSelectMenuBuilder()
            .setCustomId('admin_edit_question_select')
            .setPlaceholder('Izvēlies jautājuma tipu')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Text')
                    .setValue('admin_edit_question_select_text_' + lesson + '_' + question.id)
                    .setDefault(question.type == "text" ? true : false),
                new StringSelectMenuOptionBuilder()
                    .setLabel('Select')
                    .setValue('admin_edit_question_select_select_' + lesson + '_' + question.id)
                    .setDefault(question.type == "select" ? true : false),
            );

        const row2 = new ActionRowBuilder()
            .addComponents(select);

        const button = new ButtonBuilder()
            .setCustomId('admin_edit_question_rename_' + lesson + '_' + question)
            .setLabel('Pārdēvēt')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        const answers = await Database.getTrainingLessonQuestionAnswers(lesson, question.id);

        const disabledButton = answers.length == 0;

        const select2 = new ButtonBuilder()
            .setCustomId('admin_edit_training_question_answer_select_' + lesson + '_' + question.id)
            .setDisabled(disabledButton)
            .setLabel('Skatīt atbildes')
            .setStyle(ButtonStyle.Secondary);

        const select3 = new ButtonBuilder()
            .setCustomId('admin_edit_training_question_answer_add_text_' + lesson + '_' + question.id)
            .setLabel('Pievienot atbildi')
            .setStyle(ButtonStyle.Secondary);

        const row3 = new ActionRowBuilder()
            .addComponents(select2, select3);

        const topEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Admin')
            .setDescription("Izvēlies ko vēlies darīt ar jautājumu.")
            .setTimestamp()
            .setFooter({ text: 'Eksāmenu palīgs' });

        return {
            components: [row, row3, row2],
            embeds: [topEmbed],
            ephemeral: true
        };
    }
}

async function admin_editTrainingLessonEmbed(type, lesson) {
    if (type == "choose") {
        const button = new ButtonBuilder()
            .setCustomId('admin_edit_lesson_rename_' + lesson)
            .setLabel('Pārdēvēt')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        const topEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Admin')
            .setDescription("Izvēlies ko vēlies darīt ar treniņa mācību.")
            .setTimestamp()
            .setFooter({ text: 'Eksāmenu palīgs' });

        return {
            components: [row],
            embeds: [topEmbed],
            ephemeral: true
        };
    }
}

function admin_CreateLessonModal(forWhat) {
    const modal = new ModalBuilder()
        .setCustomId('add_training_lesson_' + forWhat)
        .setTitle('Pievienot mācību');

    const titleInput = new TextInputBuilder()
        .setCustomId('add_training_lesson_title')
        .setLabel('Nosaukums')
        .setStyle(TextInputStyle.Paragraph);

    const idInput = new TextInputBuilder()
        .setCustomId('add_training_lesson_id')
        .setLabel('ID (1-100)')
        .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(idInput);

    modal.addComponents(firstActionRow, secondActionRow);

    return modal;
}

function admin_editTrainingQuestionModal(mode, lesson, questionId) {
    const question = Database.getQuestionFromId(lesson, questionId);

    if (mode == "select") {

    } else {

    }
}

async function admin_editTrainingQuestionAnswerModal(lesson, questionId, type, answerId) {
    const answer = await Database.getTrainingLessonQuestionAnswer(lesson, questionId, answerId, type);

    if (type == "select") {

        const modal = new ModalBuilder()
            .setCustomId('edit_training_question_answer_' + lesson + '_' + questionId + '_' + answerId + '_' + type)
            .setTitle('Rediģēt jautājuma atbildi');

        const titleInput = new TextInputBuilder()
            .setCustomId('edit_training_question_answer')
            .setLabel('Atbilde')
            .setValue(Object.keys(answer)[0])
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder().addComponents(titleInput);

        modal.addComponents(firstActionRow);

        return modal;
    } else {

        const modal = new ModalBuilder()
            .setCustomId('edit_training_question_answer_' + lesson + '_' + questionId + '_' + answerId + '_' + type)
            .setTitle('Rediģēt jautājuma atbildi');

        const titleInput = new TextInputBuilder()
            .setCustomId('edit_training_question_answer')
            .setLabel('Atbilde')
            .setValue(answer)
            .setStyle(TextInputStyle.Paragraph);
        
        const firstActionRow = new ActionRowBuilder().addComponents(titleInput);

        modal.addComponents(firstActionRow);

        return modal;
    }
}

module.exports = {
    admin_ChooseLessonEmbed,
    admin_CreateLessonModal,
    admin_CreateQuestionModal,
    admin_confirmDelete,
    admin_editTrainingLessonEmbed,
    admin_editTrainingQuestionAnswerModal,
    admin_editTrainingQuestionEmbed,
    admin_renameTrainingLessonModal,
    admin_TrainingLessonQuestionAnswersEmbed,
    admin_chooseQuestionEmbed
}