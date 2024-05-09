const { myProfileHistoryLesson } = require("../../Functions/embeds");

async function MyProfileSelectMenu(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.values[0].startsWith('select_history_lesson_')) {
        let lesson = interaction.values[0].split('_')[3];
        let user = interaction.user.id;

        await interaction.update(myProfileHistoryLesson(user, lesson, 1));
    }
}

module.exports = {
    MyProfileSelectMenu
}