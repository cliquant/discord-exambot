const { ChannelType, PermissionFlagsBits, ActivityType, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const Database = require("../Functions/database");
const { bookFirstPage, bookSelectTopic, admin_renameTrainingLessonModal } = require("../Functions/embeds");
const { MAX_ACTIVE_LESSONS, GUILD_CATEGORY_LESSONS_ID, GUILD_ADMIN_ROLE_ID } = process.env;

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId.startsWith('admin_edit_lesson_rename_')) {
            let lessonId = interaction.customId.split('_')[4]
            
            await interaction.showModal(admin_renameTrainingLessonModal(lessonId));
        }
        if (interaction.customId.startsWith('cancel_delete_')) {
            await interaction.update({ content: `Atcelta dzēšana!`, ephemeral: true, components: [], embeds: [] });
        }
        if (interaction.customId.startsWith('confirm_delete_')) {
            let what = interaction.customId.split('_')[2]
            let ID = interaction.customId.split('_')[3]

            if (what == 'trainingLesson') {
                let exist = Database.getLessonsInArray().find(lesson => lesson.id === ID)
                if (!exist) return await interaction.update({ content: `Treniņš ar šādu ID neeksistē!`, ephemeral: true });
                Database.deleteTrainingLesson(ID)
                await interaction.update({ content: `Treniņš veiksmīgi dzēsts!`, ephemeral: true, components: [], embeds: [] });
            }

            if (what == 'trainingQuestion') {

                let actualLesson = ID.split('-')[0]
                let actualQuestion = ID.split('-')[1]

                let exist = Database.getLessonQuestionFromId(actualLesson, actualQuestion)
                if (!exist) return await interaction.update({ content: `Jautājums ar šādu ID neeksistē!`, ephemeral: true });
                Database.deleteTrainingQuestion(actualLesson, actualQuestion)
                await interaction.update({ content: `Jautājums veiksmīgi dzēsts!`, ephemeral: true, components: [], embeds: [] });
            }
        }
        if (interaction.customId.startsWith('admin_select_lesson_')) {
            let lessonId = interaction.customId.split('_')[3]
            let forWhat = interaction.customId.split('_')[4]
            let forWhat2 = forWhat.split('-')[1].replace('(', '').replace(')', '')

            if (forWhat2 == 'trainingQuestion_') {
                Database.deleteTrainingLesson(lessonId)
                await interaction.reply({ content: `Treniņš veiksmīgi dzēsts!`, ephemeral: true });
            }
        } 
    
    }
}