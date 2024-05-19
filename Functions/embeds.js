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
    admin_chooseQuestionEmbed,
    admin_addTrainingQuestionAnswerModal,
    renameTrainingQuestionTitle,
    trainingQuestionHintModa,
    admin_BookTopicAddModal,
    admin_ChooseBookLessonEmbed,
    admin_renameBookTopicModal,
    admin_editBookTopicEmbed,
    admin_editBookLessonEmbed,
    admin_editBookLessonModal
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
    admin_chooseQuestionEmbed,
    admin_addTrainingQuestionAnswerModal,
    renameTrainingQuestionTitle,
    trainingQuestionHintModa,
    admin_BookTopicAddModal,
    admin_ChooseBookLessonEmbed,
    admin_renameBookTopicModal,
    admin_editBookTopicEmbed,
    admin_editBookLessonEmbed,
    admin_editBookLessonModal
}