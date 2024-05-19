const { SlashCommandBuilder } = require("discord.js");
const embeds = require("../../Functions/embeds");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('train')
		.setDescription('Ar šo komandu ir iespējams redzēt top lietotājus ( punktus ir iespējams iegūt darot treniņus ).'),
	async execute(interaction) {
        await interaction.reply(await embeds.createStartEmbed(true));
	},
};