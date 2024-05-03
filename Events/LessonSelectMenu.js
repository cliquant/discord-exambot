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
        if (interaction.values[0].startsWith('select_answer_')) {
            // .setValue(`select_answer_${lesson}_${questionId}_${lesson.id}`)
            let lesson = interaction.values[0].split('_')[2];
            let questionId = interaction.values[0].split('_')[3];
            let selectAnswerId = interaction.values[0].split('_')[4];

            console.log(interaction.values[0])

			console.log(interaction.values[0].split('_'))

            let correct = Database.checkAnswer(lesson, questionId, selectAnswerId);

            interaction.update(createQuestionEmbed(lesson, questionId, interaction.user.id, true, correct));

            Database.addActiveLessonHistoryAnswer(interaction.user.id, interaction.channel.id, lesson, questionId, selectAnswerId, true)

			await interaction.update(createQuestionEmbed(lesson, questionId, interaction.user.id, true, correct))

			let nextId = Database.getLessonNextQuestionId(interaction.user.id, interaction.channel.id, lesson, questionId);

			if (nextId === 'there_is_no_more_questions') {
				await interaction.channel.send(lessonFinishedEmbed(interaction.user.id, interaction.channel.id))
				Database.addToUserHistoryALesson(interaction.user.id, Database.getActiveLessonByChannel(interaction.channel.id))
			} else {
                
				await interaction.channel.send(createQuestionEmbed(lesson, nextId, interaction.user.id, false, false));		
            }
        }
        
    }
}