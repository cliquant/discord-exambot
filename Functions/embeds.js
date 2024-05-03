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

    const button = new ButtonBuilder()
        .setCustomId('my_profile')
        .setLabel('Mans Profils')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(button);

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
        components: [row],
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

function createQuestionEmbed(lesson, questionId, userId, answered, answeredRight) {
    const question = Database.getQuestionFromId(lesson, questionId);

    const answer = new ButtonBuilder()
        .setCustomId('answer_question_' + questionId + '_' + lesson)
        .setLabel('Atbildēt')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(answered);
    
    const takeHint = new ButtonBuilder()
        .setCustomId('take_hint_' + questionId + '_' + lesson)
        .setLabel('Paņemt hint')
        .setStyle(ButtonStyle.Success)
        .setDisabled(!Database.canUseHint(userId, lesson, questionId) || answered)

    const row = new ActionRowBuilder()
        .addComponents(answer, takeHint);

    let desc = "```" + question.question + "```";

    if (answered) {
        if (answeredRight) {
            desc += "\n\n```Atbilde: " + question.answers[0] + "```";
            desc += "\n\n" + "```🟢 Pareizi atbildēts! Tu ieguvi: " + question.reward + " punktus!" + "```";
        } else {
            desc += "\n\nAtbilde: " + question.answers[0];
            desc += "\n\n" + "```🔴 Nepareizi atbildēts!```";
        }
    }

    const questionEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Jautājums')
        .setDescription(desc)
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        embeds: [questionEmbed],
        components: [row],
    };
}

function createAnswerModal(lesson, questionId, messageId) {
    let question = Database.getQuestionFromId(lesson, questionId);
    const modal = new ModalBuilder()
        .setCustomId('answer_modal_' + questionId + '_' + lesson + '_' + messageId)
        .setTitle('Atbilde uz jautājumu');

    const favoriteColorInput = new TextInputBuilder()
        .setCustomId('answer_to_question')
        .setLabel(question.question)
        .setStyle(TextInputStyle.Paragraph);


    const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);

    modal.addComponents(firstActionRow);

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

function lessonFinishedEmbed(userId, channelId) {
    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Treniņš pabeigts')
        .setDescription("Tu esi pabeidzis treniņu, šeit ir tava atbilžu vēsture. Spied uz pogas 'Beigt treniņu' lai pabeigtu pa visam šo treniņu.")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    let answers = Database.getActiveLessonHistory(userId, channelId);

    let message = "";

    let lesson = Database.getActiveLessonByChannel(channelId);

    question1 = 0;

    totalPoints = 0;

    answersRight = 0;

    fromAnswers = answers.length;

    answers.forEach(answer => {
        question1++;
        answersRight += answer.correct ? 1 : 0;
        emoji = answer.correct ? "🟢" : "🔴";
        totalPoints += answer.correct ? Database.getQuestionFromId(lesson.type, answer.questionId).reward : 0;
        let question = Database.getQuestionFromId(lesson.type, answer.questionId);
        message += "```" + "" + question.question + "\n" + "Tava atbilde: " + answer.answer + "\nPareizā atbilde: " + question.answers[0] + "```";
        message += "\n\n";
    });

    message += "```Tu esi atbildējis pareizi uz " + answersRight + " no " + fromAnswers + " jautājumiem!```\n";
    message += "```Tu esi ieguvis kopā " + totalPoints + " punktus!```";


    const topEmbed2 = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Atbilžu vēsture')
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    const end = new ButtonBuilder()
        .setCustomId('end_lesson')
        .setLabel('Beigt treniņu')
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder()
        .addComponents(end);

    return {
        embeds: [topEmbed2, topEmbed],
        components: [row],
    };
}

function myProfileEmbed(user) {
    let lessons = getLessonsInArray();
    let databaseUser = Database.getUser(user.id);
    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Mans profils')
        .setDescription(`> Coins: ${databaseUser.coins}\n`)
        .setTimestamp()
        .setThumbnail('https://cdn.discordapp.com/avatars/' + user.id + '/' + user.avatar + '.png')
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        embeds: [topEmbed],
        ephemeral: true
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
    usersWhoCurrentlyTraining,
    lessonFinishedEmbed,
    myProfileEmbed
}