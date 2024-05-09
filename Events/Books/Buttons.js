const { bookFirstPage, bookSelectTopic } = require("../../Functions/embeds");

async function BooksButtons(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'start_books') {
        await interaction.reply(bookFirstPage());
    }
    if (interaction.customId.startsWith('select_book_topic_')) {
        let lesson = interaction.customId.split('_')[3];
        await interaction.update(bookSelectTopic(lesson));
    } 
}

module.exports = {
    BooksButtons
}