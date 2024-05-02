const { ChannelType, PermissionFlagsBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { createQuestionEmbed, createStartLessonEmbed, createSelectLessonMenu } = require("../Functions/embeds");
const { set } = require("lodash");
const { MAX_ACTIVE_LESSONS, GUILD_CATEGORY_LESSONS_ID, GUILD_ADMIN_ROLE_ID } = process.env;

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.values[0].startsWith('select_lesson_')) {
            let lesson = interaction.values[0].split('_')[2];

            interaction.message.edit(createStartLessonEmbed(false));
            interaction.reply({ content: 'Treniņš sākts mācībā: ```' + Database.getTitleFromLessonId(lesson) + '```'});

            let firstId = Database.getLessonFirstQuestionId(lesson);

            setTimeout(() => {
                interaction.channel.send(createQuestionEmbed(lesson, firstId, interaction.user.id));
            }, 500);

            Database.setActiveLessonType(interaction.channel.id, lesson, firstId);
        }
    }
}