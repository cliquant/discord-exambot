const { ChannelType, PermissionFlagsBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { createQuestionEmbed, createStartLessonEmbed, createSelectLessonMenu } = require("../Functions/embeds");
const { MAX_ACTIVE_LESSONS, GUILD_CATEGORY_LESSONS_ID, GUILD_ADMIN_ROLE_ID } = process.env;

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.values[0].startsWith('select_lesson_')) {
            let lesson = interaction.values[0].split('_')[2];
            let lessonName = Database.getTitleFromLessonId(lesson)

            interaction.update(createStartLessonEmbed(false));

            let firstId = Database.getLessonFirstQuestionId(lesson);
            let questionEmbed = createQuestionEmbed(lesson, firstId, interaction.user.id, false, false);
    
            await interaction.channel.send(questionEmbed);

            Database.setActiveLessonType(interaction.channel.id, lesson, firstId);
        }
        
    }
}