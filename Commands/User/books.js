const { SlashCommandBuilder } = require("discord.js");
const embeds = require("../../Functions/embeds");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('books')
		.setDescription('Ar šo komandu ir iespējams izlasīt (grāmatu) par kādu specifisku tēmu paskaidrojumu.'),
	async execute(interaction) {
        await interaction.reply(embeds.createBooksEmbed(true));
	},
};