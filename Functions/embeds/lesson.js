const { ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, messageLink} = require("discord.js");
const { getTop5Users, getLessonsInArray, getTitleFromLessonId } = require("../database");
const Database = require("../database");
const { GUILD_BOOKS_CHANNEL_ID, GUILD_TRAIN_CHANNEL_ID, GUILD_TOP_CHANNEL_ID, GUILD_START_CHANNEL_ID, START_CHANNEL_ENABLED, BOOKS_CHANNEL_ENABLD, TOP_CHANNEL_ENABLED, TRAINING_CHANNEL_ENABLED } = process.env;


async function createSelectLessonMenu() {
    const lessons = await getLessonsInArray();

    if (lessons.length == 0) {
        return {
            content: 'Nav mācību',
            ephemeral: true
        };
    }
    
    const options = await Promise.all(lessons.map(async (lesson) => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(await getTitleFromLessonId(lesson))
            .setValue("select_lesson_" + lesson);
    }));

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

function createBooksEmbed(boolean = false) {
    const button = new ButtonBuilder()
        .setCustomId('start_books')
        .setLabel('Sākt mācīties')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(button);

    const booksEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Grāmatas')
        .setDescription("```Šeit ir saraksts ar grāmatām, kuras var noderēt eksāmena sagatavošanās. Spied uz pogas 'Sākt mācīties'.```")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

    return {
        components: [row],
        embeds: [booksEmbed],
        ephemeral: boolean
    };

}

async function bookFirstPage() {
    const lessons = await Database.getBookLessonsIdsInArray();

    let options;

    if (lessons.length == 0) {
        options = [new StringSelectMenuOptionBuilder()
            .setLabel("Nav mācību")
            .setValue("aaaaaaaaaaaaaaaaa")];
    } else {
        options = await Promise.all(lessons.map(async (lesson) => {
            return new StringSelectMenuOptionBuilder()
                .setLabel(await Database.getBookLessonTitleFromId(lesson))
                .setValue("lesson_book_" + lesson);
        }));
    }
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('book_select_lesson')
        .setPlaceholder('Izvēlies mācību')
        .addOptions(options);

    const row = new ActionRowBuilder()
        .addComponents(selectMenu);

    const booksEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Grāmatas')
        .setDescription("```Izvēlies grāmatu, lai uzzinātu vairāk par tās saturu.```")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

    return {
        components: [row],
        embeds: [booksEmbed],
        ephemeral: true
    };
}

async function bookContentPage(title, content, lesson) {
    const button = new ButtonBuilder()
        .setCustomId('select_book_topic_' + lesson)
        .setLabel('Atpakaļ')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(button);

    const booksEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle(title)
        .setDescription(content)
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

    return {
        components: [row],
        embeds: [booksEmbed],
        ephemeral: true
    };
}

async function bookSelectTopic(lesson) {
    const topics = await Database.getTopicIdsInArray(lesson);

    if (topics.length == 0) {
        return {
            content: 'Šai mācībai nav tēmu',
            ephemeral: true
        };
    }

    const options = await Promise.all(topics.map(async (topic) => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(await Database.getTopicTitleFromId(lesson, topic))
            .setValue("topic_book_" + topic + "_" + lesson);
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_book')
        .setPlaceholder('Izvēlies tēmu')
        .addOptions(options);

    const row = new ActionRowBuilder()
        .addComponents(selectMenu);

    const booksEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Grāmatas')
        .setDescription("```Izvēlies tēmu, lai uzzinātu vairāk par tās saturu.```")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

    return {
        components: [row],
        embeds: [booksEmbed],
        ephemeral: true
    };
}

module.exports = {
    createSelectLessonMenu,
    createBooksEmbed,
    bookFirstPage,
    bookSelectTopic,
    bookContentPage
};