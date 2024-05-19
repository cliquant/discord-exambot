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
            await interaction.reply({ content: 'Tu neesi šobrīd treniņā!', ephemeral: true });
            return;
        } else {
            await interaction.reply({ content: 'Treniņš ir apstādināts!', ephemeral: true });
            await Database.removeActiveLesson(userId, channelId);
            await interaction.channel.delete();
        }
	},
};