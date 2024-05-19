const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const embeds = require("../../Functions/embeds");
const Database = require("../../Functions/database");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Darbības gar mācību sistēmu.'),
	async execute(interaction) {
		const user = interaction.user;

		await Database.getActiveLessonRewardCountTotal(user.id, 1000);
	},
};