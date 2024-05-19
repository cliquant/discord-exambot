const Database = require("../../Functions/database");
const { bookSelectTopic, bookContentPage } = require("../../Functions/embeds");

async function BooksSelectMenu(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.values[0].startsWith('lesson_book_')) {
        let book_lesson = interaction.values[0].split('_')[2];

        await interaction.update(await bookSelectTopic(book_lesson));
    }

    if (interaction.values[0].startsWith('topic_book_')) {
        let book_topic = interaction.values[0].split('_')[2];
        let book_lesson = interaction.values[0].split('_')[3];
        let book_content = await Database.getTopicContentFromId(book_lesson, book_topic);

        await interaction.update(await bookContentPage(await Database.getTopicTitleFromId(book_lesson, book_topic), book_content, book_lesson));
    }
}

module.exports = {
    BooksSelectMenu
}