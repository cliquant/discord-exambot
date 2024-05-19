const { SlashCommandBuilder } = require("discord.js");
const embeds = require("../../Functions/embeds");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('active')
		.setDescription('Apskati aktīvos lietotājus kuri šobrīd trenējas. 📊'),
	async execute(interaction) {
        await interaction.reply(await embeds.usersWhoCurrentlyTraining(true));
	},
};