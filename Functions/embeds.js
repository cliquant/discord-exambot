const { ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const { getTop5Users, getLessonsInArray, getTitleFromLessonId } = require("./database");
const Database = require("./database");
const { GUILD_BOOKS_CHANNEL_ID, GUILD_TRAIN_CHANNEL_ID, GUILD_TOP_CHANNEL_ID, GUILD_START_CHANNEL_ID } = process.env;

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

function createStartLessonEmbed(something) {

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

    if (something) {
        return {
            components: [row, row2],
            embeds: [startedLessonEmbed],
        };
    } else {
        return {
            components: [row],
            embeds: [startedLessonEmbed],
        };
    }
}

function createQuestionEmbed(lesson, questionId, userId) {
    const question = Database.getQuestionFromId(lesson, questionId);

    const answer = new ButtonBuilder()
        .setCustomId('answer_question_' + questionId + '_' + lesson)
        .setLabel('Atbildēt')
        .setStyle(ButtonStyle.Secondary);
    
    const takeHint = new ButtonBuilder()
        .setCustomId('take_hint_' + questionId + '_' + lesson)
        .setLabel('Paņemt hint')
        .setStyle(ButtonStyle.Success)
        .setDisabled(!Database.canUseHint(userId, lesson, questionId))

    const row = new ActionRowBuilder()
        .addComponents(answer, takeHint);

    const questionEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Jautājums')
        .setDescription(question.question)
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        embeds: [questionEmbed],
        components: [row],
    };
}

function createAnswerModal(lesson, questionId) {
    console.log(lesson + " " + questionId)
    let question = Database.getQuestionFromId(lesson, questionId);
    const modal = new ModalBuilder()
        .setCustomId('answer_submit_modal_' + questionId)
        .setTitle('Atbilde');

    const answerInput = new TextInputBuilder()
        .setCustomId('answer_submit_input_' + questionId)
        .setLabel("Atbilde")
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(1)
        .setPlaceholder('Ieraksti atbildi šeit');

    modal.addComponents(answerInput);

    return modal;
}

function createBooksEmbed() {
    const button = new ButtonBuilder()
        .setCustomId('start_books')
        .setLabel('Sākt mācīties')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(button)

    const booksEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Grāmatas')
        .setDescription("```Šeit ir saraksts ar grāmatām, kuras var noderēt eksāmena sagatavošanās. Spied uz pogas 'Sākt mācīties'.```")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        components: [row],
        embeds: [booksEmbed],
    };

}

function bookFirstPage() {
    const lessons = Database.getBookLessonsIdsInArray();
    const options = lessons.map(lesson => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(Database.getBookLessonTitleFromId(lesson))
            .setValue("lesson_book_" + lesson)
    });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('book_select_lesson')
        .setPlaceholder('Izvēlies mācību')
        .addOptions(options);

    const row = new ActionRowBuilder()
        .addComponents(selectMenu)

    const booksEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Grāmatas')
        .setDescription("```Izvēlies grāmatu, lai uzzinātu vairāk par tās saturu.```")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        components: [row],
        embeds: [booksEmbed],
        ephemeral: true
    };
}

function bookContentPage(title, content, lesson) {
    const button = new ButtonBuilder()
        .setCustomId('select_book_topic_' + lesson)
        .setLabel('Atpakaļ')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(button)

    const booksEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle(title)
        .setDescription(content)
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        components: [row],
        embeds: [booksEmbed],
        ephemeral: true
    };
}

function bookSelectTopic(lesson) {
    const topics = Database.getTopicIdsInArray(lesson);

    const options = topics.map(topic => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(Database.getTopicTitleFromId(lesson, topic))
            .setValue("topic_book_" + topic + "_" + lesson)
    });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_book')
        .setPlaceholder('Izvēlies tēmu')
        .addOptions(options);

    const row = new ActionRowBuilder()
        .addComponents(selectMenu)

    const booksEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Grāmatas')
        .setDescription("```Izvēlies tēmu, lai uzzinātu vairāk par tās saturu.```")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        components: [row],
        embeds: [booksEmbed],
        ephemeral: true
    };
}

function explainBotEmbed() {
    const booksEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Sākums')
        .setDescription("\n\n<#" + GUILD_BOOKS_CHANNEL_ID + "> - Šaja channel ir iespējams izlasīt par kādu specifisku tēmu paskaidrojumu.\n<#" + GUILD_TRAIN_CHANNEL_ID + "> - Šeit ir iespējams sākt treniņu lai pārbaudītu savas zināšanas\n<#" + GUILD_TOP_CHANNEL_ID + "> - Šeit ir iespējams redzēt top lietotājus ( punktus ir iespējams iegūt darot treniņus )\n\n```Bots veidots priekš JPTC izaicinājuma, paša pieredzei un ar mērķi palīdzēt studentiem sagatavoties eksāmeniem.```")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        embeds: [booksEmbed],
    };
}

function usersWhoCurrentlyTraining() {
    let lessons = getLessonsInArray();
    let topMessage = "";
    lessons.forEach(lesson => {
        let activeUsers = Database.getActiveLessonUsersByType(lesson);
        topMessage += `**${getTitleFromLessonId(lesson)}**:\n`;
        activeUsers.forEach(user => {
            topMessage += `<@${user[0]}> - ` + "``" + `${Database.getLessonQuestionFromId(lesson, user[2]).question}` + "``" + ` - ${Database.formatTime(Database.getStartedAt(user[0], user[1]))}\n`;
        });
    });

    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Šobrīd trenējas')
        .setDescription(topMessage)
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        embeds: [topEmbed],
    };
}

module.exports = {
    createStartEmbed,
    createTopEmbed,
    createSelectLessonMenu,
    createStartLessonEmbed,
    createQuestionEmbed,
    createAnswerModal,
    createBooksEmbed,
    bookFirstPage,
    bookSelectTopic,
    bookContentPage,
    explainBotEmbed,
    usersWhoCurrentlyTraining
}