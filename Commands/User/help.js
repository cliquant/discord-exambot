const { SlashCommandBuilder } = require("discord.js");
const embeds = require("../../Functions/embeds");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Izskaidro, kā darbojas bots.'),
	async execute(interaction) {
        const user = interaction.user;

        await interaction.reply(await embeds.explainBotEmbed(user));
	},
};