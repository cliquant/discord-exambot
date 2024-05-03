const { ChannelType, PermissionFlagsBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { bookFirstPage, bookSelectTopic } = require("../Functions/embeds");
const { MAX_ACTIVE_LESSONS, GUILD_CATEGORY_LESSONS_ID, GUILD_ADMIN_ROLE_ID } = process.env;

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId === 'start_books') {
            await interaction.reply(bookFirstPage());
        }
        if (interaction.customId.includes('select_book_topic_')) {
            let lesson = interaction.customId.split('_')[3];
            await interaction.update(bookSelectTopic(lesson));
        } 
    
    }
}