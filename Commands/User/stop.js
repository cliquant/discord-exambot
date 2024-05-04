const Database = require("../../Functions/database");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Apstādina šobīdrējošo treniņu.'),
	async execute(interaction) {
        const user = interaction.user;
        const userId = user.id;
        const channelId = interaction.channel.id;

        if (!Database.getActiveLessonByChannel(channelId)) {
            interaction.reply({ content: 'Tu neesi šobrīd treniņā!', ephemeral: true });
            return;
        } else {
            interaction.reply({ content: 'Treniņš ir apstādināts!', ephemeral: true });
            Database.removeActiveLesson(userId, channelId);
            interaction.channel.delete();
        }
	},
};