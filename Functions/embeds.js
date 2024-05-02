const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const { getTop5Users, getLessonsInArray, getTitleFromLessonId } = require("./database");

function createStartEmbed() {
    const start = new ButtonBuilder()
        .setCustomId('start_lesson')
        .setLabel('Sākt treniņu')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(start);

    const exampleEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Start')
        .setDescription("Es esmu eksāmenu palīgs, kad uzspiedīsiet uz 'Sākt treniņu'\n tiks izveidots channel kurā jūs varēsiet izvēlēties mācību.\n\n```Ja esi gatavs pārbaudei, spied 'Sākt treniņu'```")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        embeds: [exampleEmbed],
        components: [row],
    };
}

function createTopEmbed(users) {

    let lessons = getLessonsInArray();
    let topMessage = "Šeit ir katras mācības top 5 lietotāji\n\n";
    lessons.forEach(lesson => {
        let topUsers = getTop5Users(lesson);
        topMessage += `**${getTitleFromLessonId(lesson)}**:\n`;
        topUsers.forEach((user, index) => {
            topMessage += `${index + 1}. <@${user.userId}> - ${user.points} punkti\n`;
        });
    });

    topMessage += "\n\n*Top lietotāji atjaunojas ik pēc 1 sekundēs.*";

    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Lietotāju tops')
        .setDescription(topMessage)
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        embeds: [topEmbed],
    };
}

function createSelectLessonMenu() {
    console.log("Creating select lesson menu")
    const lessons = getLessonsInArray();
    const options = lessons.map(lesson => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(getTitleFromLessonId(lesson))
            .setValue("select_lesson_" + lesson)
    });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_lesson')
        .setPlaceholder('Izvēlies mācību')
        .addOptions(options);

    const row = new ActionRowBuilder()
        .addComponents(selectMenu);

    return {
        content: 'Izvēlies mācību kurā vēlies pārbaudīt savas zināšanas',
        components: [row],
    };
}

function createStartLessonEmbed() {

    const end = new ButtonBuilder()
    .setCustomId('end_lesson')
    .setLabel('Beigt treniņu')
    .setStyle(ButtonStyle.Danger);

    const lessons = getLessonsInArray();
    const options = lessons.map(lesson => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(getTitleFromLessonId(lesson))
            .setValue("select_lesson_" + lesson)
    });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_lesson')
        .setPlaceholder('Izvēlies mācību')
        .addOptions(options);

    const row = new ActionRowBuilder()
        .addComponents(end)

    const row2 = new ActionRowBuilder()
        .addComponents(selectMenu);

    const startedLessonEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Mācību sākums')
        .setDescription("Tu esi sācis mācību, izvēlies mācību no saraksta, lai sāktu pārbaudi. Speid uz pogas 'Beigt treniņu' lai pārtrauktu.")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        components: [row, row2],
        embeds: [startedLessonEmbed],
    };
}

module.exports = {
    createStartEmbed,
    createTopEmbed,
    createSelectLessonMenu,
    createStartLessonEmbed
}