const { ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, messageLink} = require("discord.js");
const { getTop5Users, getLessonsInArray, getTitleFromLessonId } = require("./database");
const Database = require("./database");
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
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        embeds: [exampleEmbed],
        components: [row],
        ephemeral: boolean
    };
}

function createTopEmbed(boolean = false) {
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
        embeds: [topEmbed],
        ephemeral: boolean
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
                .setPlaceholder('Izvēlies atbildi')
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

function createBooksEmbed(boolean = false) {
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
        ephemeral: boolean
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
    }

    let commandsMessage = "";

    for (const [key, value] of Object.entries(commands)) {
        commandsMessage += `> **/${key}** - ${value}\n`;
    }

    const booksEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Sākums')
        .setDescription("\n\n" + books_channel_message + training_channel_message + top_channel_message + "\n\n" + commandsMessage + "\n\n```Bots veidots priekš JPTC izaicinājuma, paša pieredzei un ar mērķi palīdzēt studentiem sagatavoties eksāmeniem.```")
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

function usersWhoCurrentlyTraining(boolean = false) {
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
        ephemeral: boolean
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

    message += "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯";

    answers.forEach(answer => {
        question1++;

        emoji = answer.correct ? "🟢" : "🔴";
        let question = Database.getQuestionFromId(lesson.type, answer.questionId);
        console.log(answer)
        console.log(question)
        if (answer.correct) {
            answersRight++;
            totalPoints += question.reward;
        }
        let isLast = question1 == fromAnswers;
        if (question.type == "text") {
            message += "```" + "" + question.question + "```" + "\n> Tava atbilde: **" + answer.answer + "** " + emoji + "\n> Pareizā atbilde: **" + question.answers[0] + "**";
        } else {
            let correctAnswer;
            question.select.find(answer => {
                if (answer[Object.keys(answer)[0]] == true) {
                    correctAnswer = Object.keys(answer)[0]
                    return true;
                }
            });
            let yourAnswer;
            question.select.find(answer1 => {
                if (answer1.id == answer.answer) {
                    yourAnswer = Object.keys(answer1)[0]
                    return true;
                }
            });
            message += "```" + "" + question.question + "```" + "\n> Tava atbilde: **" + yourAnswer + "** " + emoji + "\n> Pareizā atbilde: **" + correctAnswer + "**";
        }

        if (isLast) {
            message += "\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n";
        } else {
            message += "\n";
        }
    });

    message += "> Tu esi atbildējis pareizi uz **" + answersRight + "** no **" + fromAnswers + "** jautājumiem!\n";
    message += "> Tu esi ieguvis kopā **" + totalPoints + "** punktus!";


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
        .setDescription(`> **Coins** - ${databaseUser.coins}\n\n${myPointsMessage}`)
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

function myProfileHistoryLesson(userid, lesson, page) {
    const user = Database.getUser(userid);
    const history = Database.getUserHistoryLessonInSpecificLesson(userid, lesson) || [];
    let lessonTitle = getTitleFromLessonId(lesson);
    let codePage = parseInt(page) - 1;
    let historyLesson = history[codePage]

    function doesHaveNextPage() {
        if (history[codePage + 1]) {
            return true;
        } else {
            return false;
        }
    }

    function doesHavePreviousPage() {
        if (history[codePage - 1]) {
            return true;
        } else {
            return false;
        }
    }

    let maxPage = history.length;
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
            .setFooter({ text: 'Eksāmenu palīgs'});

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
            .setStyle(ButtonStyle.Secondary)

        row2 = new ActionRowBuilder()

        if (!historyLesson) {
            topEmbed = new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle(`Atbilžu vēsture - ${page} - ${lessonTitle}`)
                .setDescription("```Tu vēl neesi ne reizi trenējies šajā mācībā.```")
                .setTimestamp()
                .setFooter({ text: 'Eksāmenu palīgs'});
            row2.addComponents(button);
        } else {

            message = "";

            let answers = historyLesson.answerHistory;

            question1 = 0;

            totalPoints = 0;
        
            answersRight = 0;
        
            fromAnswers = answers.length;

            message += "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯";
        
            answers.forEach(answer => {
                question1++;
        
                emoji = answer.correct ? "🟢" : "🔴";
                let question = Database.getQuestionFromId(lesson, answer.questionId);
                if (answer.correct) {
                    answersRight++;
                    totalPoints += question.reward;
                }
                let isLast = question1 == fromAnswers;
                if (question.type == "text") {
                    message += "```" + "" + question.question + "```" + "\n> Tava atbilde: **" + answer.answer  + "** " + emoji + "\n> Pareizā atbilde: **" + question.answers[0] + "**";
                } else {
                    let correctAnswer;
                    question.select.find(answer => {
                        if (answer[Object.keys(answer)[0]] == true) {
                            correctAnswer = Object.keys(answer)[0]
                            return true;
                        }
                    });
                    let yourAnswer;
                    question.select.find(answer1 => {
                        if (answer1.id == answer.answer) {
                            yourAnswer = Object.keys(answer1)[0]
                            return true;
                        }
                    });
                    message += "```" + "" + question.question + "```" + "\n> Tava atbilde: **" + yourAnswer + "** " + emoji + "\n> Pareizā atbilde: **" + correctAnswer + "**";
                }
                if (isLast) {
                    message += "\n⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n";
                } else {
                    message += "\n";
                }
            });
        
            message += "> Tu esi atbildējis pareizi uz **" + answersRight + "** no **" + fromAnswers + "** jautājumiem!\n";
            message += "> Tu esi ieguvis kopā **" + totalPoints + "** punktus!";

            let start_date = new Date(historyLesson.startedAt);
            let start_date1 =
              start_date.getDate().toString().padStart(2, '0') + "/" +
              (start_date.getMonth() + 1).toString().padStart(2, '0') + "/" +
              start_date.getFullYear() + " " +
              start_date.getHours().toString().padStart(2, '0') + ":" +
              start_date.getMinutes().toString().padStart(2, '0');
            
            let end_date1;
            if (historyLesson.stoppedAt != null) {
              let end_date = new Date(historyLesson.stoppedAt);
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
                .setFooter({ text: 'Eksāmenu palīgs'}); 

            let nextPageNumber = parseInt(page) + 1;
            let previousPageNumber = parseInt(page) - 1;

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

function admin_confirmDelete(what, id) {
    const button = new ButtonBuilder()
        .setCustomId('confirm_delete_' + what + '_' + id)
        .setLabel('Dzēst')
        .setStyle(ButtonStyle.Danger);
    
    const button2 = new ButtonBuilder()
        .setCustomId('cancel_delete_' + what + '_' + id)
        .setLabel('Atcelt')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(button, button2);
    
    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Dzēst')
        .setDescription("Vai esi pārliecināts, ka vēlies dzēst?")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        components: [row],
        embeds: [topEmbed],
        ephemeral: true
    };
}

function admin_CreateQuestionModal(lesson) {
    const modal = new ModalBuilder()
        .setTitle('Pievienot jautājumu')
        .setCustomId('admin_add_question_' + lesson + '_training');
    
    const titleInput = new TextInputBuilder()
        .setCustomId('admin_add_question_title')
        .setLabel('Jautājums')
        .setStyle(TextInputStyle.Paragraph);

    const typeInput = new TextInputBuilder()
        .setCustomId('admin_add_question_type')
        .setLabel('Atbildes tips ( select/text )')
        .setStyle(TextInputStyle.Short);
    
    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(typeInput);

    modal.addComponents(firstActionRow, secondActionRow);

    return modal;
}

function admin_chooseQuestionEmbed(forWhat, lesson) {
    const questions = Database.getLessonQuestions(lesson);

    // add button "Pievienot jautājumu"
    const button = new ButtonBuilder()
        .setCustomId('admin_add_training_question_' + lesson)
        .setLabel('Pievienot jautājumu')
        .setStyle(ButtonStyle.Secondary);
    
    const row = new ActionRowBuilder()
        .addComponents(button);

    const options = questions.map(question => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(question.question)
            .setValue("admin_select_question_" + lesson + "_" + question.id + "_" + forWhat)
    });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_history_lesson')
        .setPlaceholder('Izvēlies jautājumu')
        .addOptions(options);

    const row2 = new ActionRowBuilder()
        .addComponents(selectMenu);

    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Admin')
        .setDescription("Izvēlies jautājumu.")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs'});

    return {
        components: [row, row2],
        embeds: [topEmbed],
        ephemeral: true
    };
}

function admin_ChooseLessonEmbed(forWhat) {
    const lessons = getLessonsInArray();
    const options = lessons.map(lesson => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(getTitleFromLessonId(lesson) + " ( ID: " + lesson + ")")
            .setValue("admin_select_lesson_" + lesson + "_" +  forWhat + "")
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
        embeds: [topEmbed],
        ephemeral: true
    };
}

function admin_renameTrainingLessonModal(lesson) {
    const modal = new ModalBuilder()
        .setTitle('Pārdēvēt mācību')
        .setCustomId('admin_edit_lesson_rename_' + lesson)
    
    const titleInput = new TextInputBuilder()
        .setCustomId('admin_edit_lesson_rename_title')
        .setLabel('Nosaukums')
        .setValue(getTitleFromLessonId(lesson))
        .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);

    modal.addComponents(firstActionRow);

    return modal;
}

function admin_editTrainingQuestionEmbed(type, lesson, questionId) {
    if (type == "choose") {
        const question = Database.getQuestionFromId(lesson, questionId);
        const select = new StringSelectMenuBuilder()
			.setCustomId('admin_edit_question_select')
			.setPlaceholder('Izvēlies jautājuma tipu')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Text')
					.setValue('admin_edit_question_select_text_' + lesson + '_' + question.id)
                    .setDefault(question.type == "text" ? true : false),
				new StringSelectMenuOptionBuilder()
					.setLabel('Select')
					.setValue('admin_edit_question_select_select_' + lesson + '_' + question.id)
                    .setDefault(question.type == "select" ? true : false),
			);

        const row2 = new ActionRowBuilder()
            .addComponents(select);

        const button = new ButtonBuilder()
            .setCustomId('admin_edit_question_rename_' + lesson + '_' + question)
            .setLabel('Pārdēvēt')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        const topEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Admin')
            .setDescription("Izvēlies ko vēlies darīt ar jautājumu.")
            .setTimestamp()
            .setFooter({ text: 'Eksāmenu palīgs'});

        return {
            components: [row, row2],
            embeds: [topEmbed],
            ephemeral: true
        }
    }
}


function admin_editTrainingLessonEmbed(type, lesson) {
    if (type == "choose") {
        const button = new ButtonBuilder()
            .setCustomId('admin_edit_lesson_rename_' + lesson)
            .setLabel('Pārdēvēt')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(button);

        const topEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Admin')
            .setDescription("Izvēlies ko vēlies darīt ar treniņa mācību.")
            .setTimestamp()
            .setFooter({ text: 'Eksāmenu palīgs'});

        return {
            components: [row],
            embeds: [topEmbed],
            ephemeral: true
        }
    }
}

function admin_CreateLessonModal(forWhat) {
    const modal = new ModalBuilder()
        .setCustomId('add_training_lesson_' + forWhat)
        .setTitle('Pievienot mācību')

    const titleInput = new TextInputBuilder()
        .setCustomId('add_training_lesson_title')
        .setLabel('Nosaukums')
        .setStyle(TextInputStyle.Paragraph);

    const idInput = new TextInputBuilder()
        .setCustomId('add_training_lesson_id')
        .setLabel('ID (1-100)')
        .setStyle(TextInputStyle.Short);

    const typeInput = new TextInputBuilder()
        .setCustomId('add_training_lesson_type')
        .setLabel('Tips (text/select)')
        .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
    const secondActionRow = new ActionRowBuilder().addComponents(idInput);
    const thirdActionRow = new ActionRowBuilder().addComponents(typeInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

    return modal;
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
    admin_ChooseLessonEmbed,
    admin_CreateLessonModal,
    admin_confirmDelete,
    admin_editTrainingLessonEmbed,
    admin_renameTrainingLessonModal,
    admin_editTrainingQuestionEmbed,
    admin_chooseQuestionEmbed,
    admin_CreateQuestionModal
}