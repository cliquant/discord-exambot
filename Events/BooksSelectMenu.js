const { ChannelType, PermissionFlagsBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { bookSelectTopic, bookContentPage } = require("../Functions/embeds");
const { MAX_ACTIVE_LESSONS, GUILD_CATEGORY_LESSONS_ID, GUILD_ADMIN_ROLE_ID } = process.env;


module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.values[0].startsWith('lesson_book_')) {
            let book_lesson = interaction.values[0].split('_')[2];

            interaction.update(bookSelectTopic(book_lesson));
            
        }

        if (interaction.values[0].startsWith('topic_book_')) {
            let book_topic = interaction.values[0].split('_')[2];
            let book_lesson = interaction.values[0].split('_')[3];
            let book_content = Database.getTopicContentFromId(book_lesson, book_topic);

            interaction.update(bookContentPage(Database.getTopicTitleFromId(book_lesson, book_topic), book_content, book_lesson));
        }
        
    }
}