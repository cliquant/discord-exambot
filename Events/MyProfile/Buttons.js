const { myProfileHistoryEmbedChoose, myProfileHistoryLesson, myProfileEmbed } = require("../../Functions/embeds");

async function MyProfileButtons(interaction) {
    if (!interaction.isButton()) return;
    if (interaction.customId.startsWith('my_profile_history_')) {
        let lesson = interaction.customId.split('_')[3];
        let page = interaction.customId.split('_')[4];

        await interaction.update(await myProfileHistoryLesson(interaction.user.id, lesson, page));
    }
    if (interaction.customId === 'my_profile') {
        await interaction.reply(await myProfileEmbed(interaction.user));
    }
    if (interaction.customId === 'my_profile_2') {
        await interaction.update(await myProfileEmbed(interaction.user));
    }
    if (interaction.customId === 'my_profile_history') {
        await interaction.update(await myProfileHistoryEmbedChoose(interaction.user));
    }
}

module.exports = {
    MyProfileButtons
}