const { ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, messageLink } = require("discord.js");
const { getTop5Users, getLessonsInArray, getTitleFromLessonId } = require("./database");
const Database = require("./database");
const { max } = require("moment");
const { GUILD_BOOKS_CHANNEL_ID, GUILD_TRAIN_CHANNEL_ID, GUILD_TOP_CHANNEL_ID, GUILD_START_CHANNEL_ID, START_CHANNEL_ENABLED, BOOKS_CHANNEL_ENABLD, TOP_CHANNEL_ENABLED, TRAINING_CHANNEL_ENABLED } = process.env;

const {
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
} = require("./embeds/admin");

const {
    createSelectLessonMenu,
    createBooksEmbed,
    bookFirstPage,
    bookSelectTopic,
    bookContentPage
} = require("./embeds/lesson");

const {
    createStartLessonEmbed,
    createQuestionEmbed,
    createAnswerModal,
    lessonFinishedEmbed,
} = require("./embeds/training");

const {
    createStartEmbed,
    createTopEmbed,
    explainBotEmbed,
    usersWhoCurrentlyTraining,
    myProfileEmbed,
    myProfileHistoryEmbedChoose,
    myProfileHistoryLesson
} = require("./embeds/user");

module.exports = {
    createStartEmbed,
    createTopEmbed,
    explainBotEmbed,
    usersWhoCurrentlyTraining,
    myProfileEmbed,
    myProfileHistoryEmbedChoose,
    myProfileHistoryLesson,
    createSelectLessonMenu,
    createBooksEmbed,
    bookFirstPage,
    bookSelectTopic,
    bookContentPage,
    createStartLessonEmbed,
    createQuestionEmbed,
    createAnswerModal,
    lessonFinishedEmbed,
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