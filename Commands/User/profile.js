const { SlashCommandBuilder } = require("discord.js");
const embeds = require("../../Functions/embeds");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Apskati savu profilu/progresu.'),
	async execute(interaction) {
        const user = interaction.user;

        await interaction.reply(await embeds.myProfileEmbed(user));
	},
};