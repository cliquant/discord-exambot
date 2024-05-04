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
        topMessage += `> **${getTitleFromLessonId(lesson)}**:\n`;
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
        embeds: [topEmbed]
    };
}

function createSelectLessonMenu() {
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

function createQuestionEmbed(lesson, questionId, userId, answered, answeredRight, userAnswer, disableHint = null) {
    const question = Database.getQuestionFromId(lesson, questionId);

    let answer;
    let selectMenu;

    if (question.type == "text") {
        answer = new ButtonBuilder()
            .setCustomId('answer_question_' + questionId + '_' + lesson)
            .setLabel('Atbildēt')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(answered);
    } else {
        if (!answered) {
            const options = question.select.map(lesson1 => {
                let key = Object.keys(lesson1)[0];
                let value = lesson1[key]

                return new StringSelectMenuOptionBuilder()
                    .setLabel(key)
                    .setValue(`select_answer_${lesson}_${questionId}_${lesson1.id}`)

            });

            selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_lesson')
                .setPlaceholder('Izvēlies mācību')
                .addOptions(options);
        }
    }
    
    let something = false;
    if (!Database.canUseHint(userId, lesson, questionId)) something = true;
    if (disableHint != null && disableHint == true) something = true;
    if (answered) something = true;

    const takeHint = new ButtonBuilder()
        .setCustomId('take_hint_' + questionId + '_' + lesson)
        .setLabel('Paņemt hint')
        .setStyle(ButtonStyle.Success)
        .setDisabled(something)

    let row = [];

    if (question.type == "text") {
        row[0] = new ActionRowBuilder()
        .addComponents(answer, takeHint);
    } else {
        row[0] = new ActionRowBuilder()
        .addComponents(takeHint);
        if (!answered) {
            row[1] = new ActionRowBuilder()
            .addComponents(selectMenu);
        }
    }

    let desc = "```" + question.question + "```";

    if (answered) {
        if (answeredRight) {
            if (question.type == "text") {
                desc += "```Atbilde: " + question.answers[0] + "```";
            } else {
                let correctAnswer;
                question.select.find(answer2 => {
                    if (answer2[Object.keys(answer2)[0]] == true) {
                        correctAnswer = Object.keys(answer2)[0]
                        return true;
                    }
                })
                desc += "```🎯: " +  correctAnswer + "```";
            }
            desc += "\n\n" + "```🟢 Pareizi atbildēts! Tu ieguvi: " + question.reward + " punktus!" + "```";
        } else {
            if (question.type == "text") {
                desc += "```Atbilde: " + question.answers[0] + "```";
            } else {
                let correctAnswer;
                question.select.find(answer1 => {
                    if (answer1[Object.keys(answer1)[0]] == true) {
                        correctAnswer = Object.keys(answer1)[0];
                        return true;
                    }
                })
                let userAnswer1;
                question.select.find(answer1 => {
                    if (answer1.id == userAnswer) {
                        userAnswer1 = Object.keys(answer1)[0];
                        return true;
                    }
                });
                desc += "```🎯: " +  correctAnswer + "```";
                desc += "```🫵: " +  userAnswer1 + "```";
            }
            desc += "\n\n" + "```🔴 Nepareizi atbildēts!```";
        }
    }

    let questionEmbed;

    if (question.image == "" || question.image == "none") {
        questionEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Jautājums')
            .setDescription(desc)
            .setTimestamp()
            .setFooter({ text: 'Eksāmenu palīgs'});
    } else {
        questionEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Jautājums')
            .setDescription(desc)
            .setTimestamp()
            .setImage(question.image)
            .setFooter({ text: 'Eksāmenu palīgs'});
    }

    return {
        embeds: [questionEmbed],
        components: row,
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

function explainBotEmbed(command = null) {
    const button = new ButtonBuilder()
    .setCustomId('my_profile')
    .setLabel('Mans Profils')
    .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(button);

    const booksEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Sākums')
        .setDescription("\n\n> <#" + GUILD_BOOKS_CHANNEL_ID + "> - Šaja channel ir iespējams izlasīt par kādu specifisku tēmu paskaidrojumu.\n> <#" + GUILD_TRAIN_CHANNEL_ID + "> - Šeit ir iespējams sākt treniņu lai pārbaudītu savas zināšanas\n> <#" + GUILD_TOP_CHANNEL_ID + "> - Šeit ir iespējams redzēt top lietotājus ( punktus ir iespējams iegūt darot treniņus ).\n\n```Bots veidots priekš JPTC izaicinājuma, paša pieredzei un ar mērķi palīdzēt studentiem sagatavoties eksāmeniem.```")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

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

function usersWhoCurrentlyTraining() {
    let lessons = getLessonsInArray();
    let topMessage = "";
    lessons.forEach(lesson => {
        let activeUsers = Database.getActiveLessonUsersByType(lesson);
        topMessage += `> **${getTitleFromLessonId(lesson)}**:\n`;
        activeUsers.forEach(user => {
            topMessage += `<@${user[0]}> - ` + "``" + `${Database.getLessonQuestionFromId(lesson, user[2]).question}` + "``" + ` - ${Database.formatTime(Database.getStartedAt(user[0], user[1]))}\n`;
        });
        if (activeUsers.length == 0) {
            topMessage += "*Neviens*\n";
        }
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
        .setDescription("Tu esi pabeidzis treniņu, šeit ir tava atbilžu vēsture. Spied uz pogas 'Beigt treniņu' lai aizvērtu šo channel pa visam šo treniņu.")
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

        emoji = answer.correct ? "🟢" : "🔴";
        let question = Database.getQuestionFromId(lesson.type, answer.questionId);
        totalPoints += question.reward;
        if (answer.correct) {
            answersRight++;
        }
        if (question.type == "text") {
            message += "```" + "" + question.question + "\n" + "Tava atbilde: " + answer.answer + "\nPareizā atbilde: " + question.answers[0] + "```";
        } else {
            let correctAnswer;
            question.select.find(answer => {
                if (answer[Object.keys(answer)[0]] == true) {
                    correctAnswer = Object.keys(answer)[0]
                    return true;
                }
            });
            message += "```" + "" + question.question + "\n" + "Tava atbilde: " + answer.answer + "\nPareizā atbilde: " + correctAnswer + "```";
        }
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

    const button = new ButtonBuilder()
        .setCustomId('my_profile_history')
        .setLabel('Treniņu vēsture')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(button);

    let myPointsMessage = "";
    lessons.forEach(lesson => {
        let points = Database.getUserPointsInLesson(user.id, lesson);
        myPointsMessage += `> **${getTitleFromLessonId(lesson)}** - ${points} punkti\n`;
    });

    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Mans profils')
        .setDescription(`> Coins: ${databaseUser.coins}\n\n${myPointsMessage}`)
        .setTimestamp()
        .setThumbnail('https://cdn.discordapp.com/avatars/' + user.id + '/' + user.avatar + '.png')
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        components: [row],
        embeds: [topEmbed],
        ephemeral: true
    };
}

function myProfileHistoryEmbedChoose() {
    const lessons = getLessonsInArray();
    const options = lessons.map(lesson => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(getTitleFromLessonId(lesson))
            .setValue("select_history_lesson_" + lesson)
    });

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
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        components: [row, row2],
        embeds: [topEmbed],
        ephemeral: true
    };
}

function myProfileHistoryLesson(userid, lesson) {
    let answers = Database.getUserHistoryLessonInSpecificLesson(userid, lesson);

    return {
        content: answers.toString(),
        ephemeral: true
    };
}

function admin_ChooseLessonEmbed(forWhat) {
    const lessons = getLessonsInArray();
    const options = lessons.map(lesson => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(getTitleFromLessonId(lesson))
            .setValue("admin_select_" + lesson + "_" + forWhat)
    });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_history_lesson')
        .setPlaceholder('Izvēlies mācību')
        .addOptions(options);

    const row2 = new ActionRowBuilder()
        .addComponents(selectMenu);

    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Admin')
        .setDescription("Izvēlies mācību.")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        components: [row2],
        // embeds: [topEmbed],
        ephemeral: true
    };
}

function admin_addTrainingQuestionModal(number) {
    if (number == 1) {
        const modal = new ModalBuilder()
            .setCustomId('add_training_question')
            .setTitle('Pievienot jautājumu')
            .setDescription('Pievieno jaunu jautājumu treniņiem');

        const questionInput = new TextInputBuilder()
            .setCustomId('add_training_question')
            .setLabel('Jautājums')
            .setStyle(TextInputStyle.Paragraph);

        const typeInput = new TextInputBuilder()
            .setCustomId('add_training_question')
            .setLabel('Tips (text/select)')
            .setStyle(TextInputStyle.Short);

        const answersInput = new TextInputBuilder()
            .setCustomId('add_training_question')
            .setLabel('Atbildes (atdalīt ar ```, ja tips text - piem ```atbilde1``` ```atbilde2``` ```atbilde3``` ```atbilde4``` (pievieno beigās -true/false, ja tips ir select -- ```atbilde```-true ```atbilde2```-false)) ')
            .setStyle(TextInputStyle.Paragraph);

        const rewardInput = new TextInputBuilder()
            .setCustomId('add_training_question')
            .setLabel('Punkti (0-100)')
            .setStyle(TextInputStyle.Short);

        const imageInput = new TextInputBuilder()
            .setCustomId('add_training_question')
            .setLabel('Attēls (link) - ja nav ievadiet "none"')
            .setStyle(TextInputStyle.Short);
        
        const hintEnabledInput = new TextInputBuilder()
            .setCustomId('add_training_question')
            .setLabel('Pievienot hint (true/false)')
            .setStyle(TextInputStyle.Short);

        const firstActionRow = new ActionRowBuilder().addComponents(questionInput);
        const secondActionRow = new ActionRowBuilder().addComponents(typeInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(answersInput);
        const fourthActionRow = new ActionRowBuilder().addComponents(rewardInput);
        const fifthActionRow = new ActionRowBuilder().addComponents(imageInput);
        const sixthActionRow = new ActionRowBuilder().addComponents(hintEnabledInput);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow, sixthActionRow);

        return modal;
    } else {
    }
}


function admin_CreateLessonModal(forWhat) {
    const modal = new ModalBuilder()
        .setCustomId('add_training_lesson')
        .setTitle('Pievienot mācību')
        .setDescription('Pievieno jaunu mācību treniņiem');

    const titleInput = new TextInputBuilder()
        .setCustomId('add_training_lesson_title')
        .setLabel('Nosaukums')
        .setStyle(TextInputStyle.Paragraph);

    const typeInput = new TextInputBuilder()
        .setCustomId('add_training_lesson_type')
        .setLabel('ID (1-100)')
        .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(typeInput);

    modal.addComponents(firstActionRow, secondActionRow);

    return modal;

}

function admin_addTrainingQuestionModal() {
    // 1 input = 
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
    myProfileEmbed,
    myProfileHistoryEmbedChoose,
    myProfileHistoryLesson,
    admin_addTrainingQuestionModal,
    admin_ChooseLessonEmbed,
    admin_CreateLessonModal
}