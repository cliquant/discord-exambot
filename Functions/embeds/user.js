const { ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, messageLink} = require("discord.js");
const { getTop5Users, getLessonsInArray, getTitleFromLessonId } = require("../database");
const Database = require("../database");
const { GUILD_BOOKS_CHANNEL_ID, GUILD_TRAIN_CHANNEL_ID, GUILD_TOP_CHANNEL_ID, GUILD_START_CHANNEL_ID, START_CHANNEL_ENABLED, BOOKS_CHANNEL_ENABLD, TOP_CHANNEL_ENABLED, TRAINING_CHANNEL_ENABLED } = process.env;

function createStartEmbed(boolean = false) {
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
        .setFooter({ text: 'Eksāmenu palīgs' });

    return {
        embeds: [exampleEmbed],
        components: [row],
        ephemeral: boolean
    };
}

async function createTopEmbed(boolean = false) {
    const lessons = await getLessonsInArray();
    let topMessage = "Šeit ir katras mācības top 5 lietotāji\n\n";
    for (const lesson of lessons) {
        const topUsers = await getTop5Users(lesson);
        topMessage += `> **${await getTitleFromLessonId(lesson)}**:\n`;
        topUsers.forEach((user, index) => {
            topMessage += `${index + 1}. <@${user.userId}> - ${user.points} punkti\n`;
        });
        if (topUsers.length == 0) {
            topMessage += "*Neviens*\n";
        }
    }

    topMessage += "\n\n*Top lietotāji atjaunojas ik pēc 1 sekundēs.*";

    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Lietotāju tops')
        .setDescription(topMessage)
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

    return {
        embeds: [topEmbed],
        ephemeral: boolean
    };
}

function explainBotEmbed(command = null) {
    const button = new ButtonBuilder()
        .setCustomId('my_profile')
        .setLabel('Mans Profils')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(button);

    let books_channel_message = "";
    let top_channel_message = "";
    let training_channel_message = "";

    if (BOOKS_CHANNEL_ENABLD == "true") {
        books_channel_message = "> <#" + GUILD_BOOKS_CHANNEL_ID + "> - Šajā channel ir iespējams izlasīt par kādu specifisku tēmu paskaidrojumu.\n";
    }
    if (TRAINING_CHANNEL_ENABLED == "true") {
        training_channel_message = "> <#" + GUILD_TRAIN_CHANNEL_ID + "> - Šajā channel ir iespējams sākt treniņu lai pārbaudītu savas zināšanas.\n";
    }
    if (START_CHANNEL_ENABLED == "true") {
        top_channel_message = "> <#" + GUILD_TOP_CHANNEL_ID + "> - Šeit ir iespējams redzēt top lietotājus ( punktus ir iespējams iegūt darot treniņus ).\n";
    }

    let commands = {
        "help": "Izskaidro, kā darbojas bots. ( šis pats message )",
        "profile": "Apskati savu profilu/progresu.",
        "top": "Ar šo komandu ir iespējams redzēt top lietotājus ( punktus ir iespējams iegūt darot treniņus ).",
        "books": "Ar šo komandu ir iespējams izlasīt (grāmatu) par kādu specifisku tēmu paskaidrojumu.",
        "train": "Ar šo komandu ir iespējams sākt treniņu lai pārbaudītu savas zināšanas.",
        "stop": "Ar šo komandu ir iespējams pārtraukt treniņu.",
        "active": "Ar šo komandu ir iespējams redzēt, kas šobrīd trenējas."
    };

    let commandsMessage = "";

    for (const [key, value] of Object.entries(commands)) {
        commandsMessage += `> **/${key}** - ${value}\n`;
    }

    const booksEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Sākums')
        .setDescription("\n\n" + books_channel_message + training_channel_message + top_channel_message + "\n\n" + commandsMessage + "\n\n```Bots veidots priekš JPTC izaicinājuma, paša pieredzei un ar mērķi palīdzēt studentiem sagatavoties eksāmeniem.```")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

    if (command) {
        return {
            components: [row],
            embeds: [booksEmbed],
            ephemeral: true
        };
    } else {
        return {
            components: [row],
            embeds: [booksEmbed]
        };
    }
}

async function usersWhoCurrentlyTraining(boolean = false) {
    const lessons = await getLessonsInArray();
    let topMessage = "";
    for (const lesson of lessons) {
        const activeUsers = await Database.getActiveLessonUsersByType(lesson);
        topMessage += `> **${await getTitleFromLessonId(lesson)}**:\n`;
        for (const user of activeUsers) {
            topMessage += `<@${user['userId']}> - ` + "``" + `${(await Database.getLessonQuestionFromId(lesson, user['questionId'])).question}` + "``" + ` - ${Database.formatTime(await Database.getStartedAt(user['userId'], user['channelId']))}\n`;
        }
        if (activeUsers.length == 0) {
            topMessage += "*Neviens*\n";
        }
    }

    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Šobrīd trenējas')
        .setDescription(topMessage)
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

    return {
        embeds: [topEmbed],
        ephemeral: boolean
    };
}

async function myProfileEmbed(user) {
    const lessons = await getLessonsInArray();
    const databaseUser = await Database.getUser(user.id);

    const button = new ButtonBuilder()
        .setCustomId('my_profile_history')
        .setLabel('Treniņu vēsture')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(button);

    let myPointsMessage = "";
    for (const lesson of lessons) {
        const points = await Database.getUserPointsInLesson(user.id, lesson);
        myPointsMessage += `> **${await getTitleFromLessonId(lesson)}** - ${points} punkti\n`;
    }

    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Mans profils')
        .setDescription(`> **Coins** - ${databaseUser.coins}\n\n${myPointsMessage}`)
        .setTimestamp()
        .setThumbnail('https://cdn.discordapp.com/avatars/' + user.id + '/' + user.avatar + '.png')
        .setFooter({ text: 'Eksāmenu palīgs' });

    return {
        components: [row],
        embeds: [topEmbed],
        ephemeral: true
    };
}

async function myProfileHistoryEmbedChoose() {
    const lessons = await getLessonsInArray();
    const options = await Promise.all(lessons.map(async (lesson) => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(await getTitleFromLessonId(lesson))
            .setValue("select_history_lesson_" + lesson);
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_history_lesson')
        .setPlaceholder('Izvēlies mācību')
        .addOptions(options);

    const button = new ButtonBuilder()
        .setCustomId('my_profile_2')
        .setLabel('Atpakaļ uz profilu')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(button);

    const row2 = new ActionRowBuilder()
        .addComponents(selectMenu);

    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Mans profils')
        .setDescription("Izvēlies mācību kurā vēlies redzet savas atbildes treniņos.")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

    return {
        components: [row, row2],
        embeds: [topEmbed],
        ephemeral: true
    };
}

async function myProfileHistoryLesson(userid, lesson, page) {
    const user = await Database.getUser(userid);
    const history = await Database.getUserHistoryLessonInSpecificLesson(userid, lesson) || [];
    const lessonTitle = await getTitleFromLessonId(lesson);
    const codePage = parseInt(page) - 1;
    const historyLesson = history[codePage];

    function doesHaveNextPage() {
        return history[codePage + 1] ? true : false;
    }

    function doesHavePreviousPage() {
        return history[codePage - 1] ? true : false;
    }

    const maxPage = history.length;
    if (maxPage == 0) {
        const button = new ButtonBuilder()
            .setCustomId('my_profile_history')
            .setLabel('Atpakaļ uz izvēli')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        const topEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle(`Atbilžu vēsture - ${page} - ${lessonTitle}`)
            .setDescription("Tu vēl neesi ne reizi trenējies šajā mācībā.")
            .setTimestamp()
            .setFooter({ text: 'Eksāmenu palīgs' });

        return {
            components: [row],
            embeds: [topEmbed],
            ephemeral: true
        };
    } else {
        let topEmbed;
        let row2;

        const button = new ButtonBuilder()
            .setCustomId('my_profile_history')
            .setLabel('Atpakaļ uz izvēli')
            .setStyle(ButtonStyle.Secondary);

        row2 = new ActionRowBuilder();

        if (!historyLesson) {
            topEmbed = new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle(`Atbilžu vēsture - ${page} - ${lessonTitle}`)
                .setDescription("```Tu vēl neesi ne reizi trenējies šajā mācībā.```")
                .setTimestamp()
                .setFooter({ text: 'Eksāmenu palīgs' });
            row2.addComponents(button);
        } else {
            let message = "";

            const answers = historyLesson.answerHistory;
            let question1 = 0;
            let totalPoints = 0;
            let answersRight = 0;
            const fromAnswers = answers.length;

            message += "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯";

            for (const answer of answers) {
                question1++;

                const emoji = answer.correct ? "🟢" : "🔴";
                const question = await Database.getQuestionFromId(lesson, answer.questionId);
                if (answer.correct) {
                    answersRight++;
                    totalPoints += question.reward;
                }
                const isLast = question1 === fromAnswers;
                if (question.type == "text") {
                    message += "```" + question.question + "```" + "\n> Tava atbilde: **" + answer.answer + "** " + emoji + "\n> Pareizā atbilde: **" + question.answers[0] + "**";
                } else {
                    let correctAnswer;
                    question.select.find(answer => {
                        if (answer[Object.keys(answer)[0]] == true) {
                            correctAnswer = Object.keys(answer)[0];
                            return true;
                        }
                    });
                    let yourAnswer;
                    question.select.find(answer1 => {
                        if (answer1.id == answer.answer) {
                            yourAnswer = Object.keys(answer1)[0];
                            return true;
                        }
                    });
                    message += "```" + question.question + "```" + "\n> Tava atbilde: **" + yourAnswer + "** " + emoji + "\n> Pareizā atbilde: **" + correctAnswer + "**";
                }
                if (isLast) {
                    message += "\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n";
                } else {
                    message += "\n";
                }
            }

            message += "> Tu esi atbildējis pareizi uz **" + answersRight + "** no **" + fromAnswers + "** jautājumiem!\n";
            message += "> Tu esi ieguvis kopā **" + totalPoints + "** punktus!";

            const start_date = new Date(historyLesson.startedAt);
            const start_date1 =
                start_date.getDate().toString().padStart(2, '0') + "/" +
                (start_date.getMonth() + 1).toString().padStart(2, '0') + "/" +
                start_date.getFullYear() + " " +
                start_date.getHours().toString().padStart(2, '0') + ":" +
                start_date.getMinutes().toString().padStart(2, '0');

            let end_date1;
            if (historyLesson.stoppedAt != null) {
                const end_date = new Date(historyLesson.stoppedAt);
                end_date1 =
                    end_date.getDate().toString().padStart(2, '0') + "." +
                    (end_date.getMonth() + 1).toString().padStart(2, '0') + "." +
                    end_date.getFullYear() + " " +
                    end_date.getHours().toString().padStart(2, '0') + ":" +
                    end_date.getMinutes().toString().padStart(2, '0');
            } else {
                end_date1 = "❌";
            }
            topEmbed = new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle(`Atbilžu vēsture - ${page} - ${lessonTitle}`)
                .setDescription("```Treniņš #" + page + "```\n" + "> **" + lessonTitle + "**\n" + `> Sākts: **${start_date1}**\n> Beigts: **${end_date1}**` + "\n\n" + message)
                .setTimestamp()
                .setFooter({ text: 'Eksāmenu palīgs' });

            const nextPageNumber = parseInt(page) + 1;
            const previousPageNumber = parseInt(page) - 1;

            const button_backward = new ButtonBuilder()
                .setCustomId('my_profile_history_' + lesson + '_' + (previousPageNumber))
                .setLabel('←')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!doesHavePreviousPage());

            const button_forward = new ButtonBuilder()
                .setCustomId('my_profile_history_' + lesson + '_' + (nextPageNumber))
                .setLabel('→')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!doesHaveNextPage());

            row2.addComponents(button_backward);
            row2.addComponents(button);
            row2.addComponents(button_forward);

        }

        return {
            embeds: [topEmbed],
            components: [row2],
            ephemeral: true
        };
    }
}

module.exports = {
    createStartEmbed,
    createTopEmbed,
    explainBotEmbed,
    usersWhoCurrentlyTraining,
    myProfileEmbed,
    myProfileHistoryEmbedChoose,
    myProfileHistoryLesson
}