const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const embeds = require("../../Functions/embeds");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('book')
		.setDescription('Darbības gar mācību sistēmu.')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('Izvēlies')
				.setRequired(true)
				.addChoices(
					{ name: 'topic', value: 'book_topic' },
					{ name: 'lesson', value: 'book_lesson' },
				))
		.addStringOption(option =>
			option.setName('option')
				.setDescription('Izvēlies ko gribi darīt')
				.setRequired(true)
				.addChoices(
					{ name: 'pievienot', value: 'add' },
					{ name: 'dzēst', value: 'delete' },
					{ name: 'rediģēt', value: 'edit' },
				))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const user = interaction.user;
		const type = interaction.options.getString('type');
		const option = interaction.options.getString('option');

		if (type == 'book_topic') {
			if (option == 'add') {
				await interaction.showModal(await embeds.admin_BookTopicAddModal());
			}
			if (option == 'delete') {
				await interaction.reply(await embeds.admin_ChooseBookLessonEmbed("bookTopic-delete"));
			}
			if (option == 'edit') {
				await interaction.reply(await embeds.admin_ChooseBookLessonEmbed("bookTopic-edit"));
			}
		} else if (type == 'book_lesson') {
			if (option == 'add') {
				await interaction.reply(await embeds.admin_ChooseBookLessonEmbed("bookTopic-edit"));
			}
			if (option == 'delete') {
				await interaction.reply(await embeds.admin_ChooseBookLessonEmbed("bookTopic-edit"));
			}
			if (option == 'edit') {
				await interaction.reply(await embeds.admin_ChooseBookLessonEmbed("bookTopic-edit"));
			}
		}
	},
};