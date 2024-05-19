const { ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, messageLink} = require("discord.js");
const { getTop5Users, getLessonsInArray, getTitleFromLessonId } = require("../database");
const Database = require("../database");
const { GUILD_BOOKS_CHANNEL_ID, GUILD_TRAIN_CHANNEL_ID, GUILD_TOP_CHANNEL_ID, GUILD_START_CHANNEL_ID, START_CHANNEL_ENABLED, BOOKS_CHANNEL_ENABLD, TOP_CHANNEL_ENABLED, TRAINING_CHANNEL_ENABLED } = process.env;


async function createStartLessonEmbed(something) {
    const end = new ButtonBuilder()
        .setCustomId('end_lesson')
        .setLabel('Beigt treniņu')
        .setStyle(ButtonStyle.Danger);

    const lessons = await getLessonsInArray();
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
        .addComponents(end);

    const row2 = new ActionRowBuilder()
        .addComponents(selectMenu);

    const startedLessonEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Mācību sākums')
        .setDescription("Tu esi sācis mācību, izvēlies mācību no saraksta, lai sāktu pārbaudi. Speid uz pogas 'Beigt treniņu' lai pārtrauktu.")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

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

async function createQuestionEmbed(lesson, questionId, userId, answered, answeredRight, userAnswer, disableHint = null) {
    const question = await Database.getQuestionFromId(lesson, questionId);

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
                let value = lesson1[key];

                return new StringSelectMenuOptionBuilder()
                    .setLabel(key)
                    .setValue(`select_answer_${lesson}_${questionId}_${lesson1.id}`);

            });

            selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_lesson')
                .setPlaceholder('Izvēlies atbildi')
                .addOptions(options);
        }
    }

    let something = false;
    if (!(await Database.canUseHint(userId, lesson, questionId))) something = true;
    if (disableHint != null && disableHint == true) something = true;
    if (answered) something = true;

    const takeHint = new ButtonBuilder()
        .setCustomId('take_hint_' + questionId + '_' + lesson)
        .setLabel('Paņemt hint')
        .setStyle(ButtonStyle.Success)
        .setDisabled(something);

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
                desc += "\n> **Atbilde:** " + question.answers[0];
            } else {
                let correctAnswer;
                question.select.find(answer => {
                    if (answer[Object.keys(answer)[0]] == true) {
                        correctAnswer = Object.keys(answer)[0];
                        return true;
                    }
                });
                desc += "\n> 🎯: " + correctAnswer;
            }
            if (question.reward == 1) {
                desc += "\n" + "```🟢 Pareizi atbildēts! Tu ieguvi: " + question.reward + " punktu!" + "```";
            } else {
                desc += "\n" + "```🟢 Pareizi atbildēts! Tu ieguvi: " + question.reward + " punktus!" + "```";
            }
        } else {
            if (question.type == "text") {
                desc += "\n> **Atbilde:** " + question.answers[0];
            } else {
                let correctAnswer;
                question.select.find(answer1 => {
                    if (answer1[Object.keys(answer1)[0]] == true) {
                        correctAnswer = Object.keys(answer1)[0];
                        return true;
                    }
                });
                let userAnswer1;
                question.select.find(answer1 => {
                    if (answer1.id == userAnswer) {
                        userAnswer1 = Object.keys(answer1)[0];
                        return true;
                    }
                });
                desc += "\n> 🎯: " + correctAnswer;
                desc += "\n> 🫵: " + userAnswer1;
            }
            desc += "\n" + "```🔴 Nepareizi atbildēts!```";
        }
    }

    let questionEmbed;

    if (question.image == "" || question.image == "none") {
        questionEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Jautājums')
            .setDescription(desc)
            .setTimestamp()
            .setFooter({ text: 'Eksāmenu palīgs' });
    } else {
        questionEmbed = new EmbedBuilder()
            .setColor('#ffffff')
            .setTitle('Jautājums')
            .setDescription(desc)
            .setTimestamp()
            .setImage(question.image)
            .setFooter({ text: 'Eksāmenu palīgs' });
    }

    return {
        embeds: [questionEmbed],
        components: row,
    };
}

async function createAnswerModal(lesson, questionId, messageId) {
    const question = await Database.getQuestionFromId(lesson, questionId);
    const modal = new ModalBuilder()
        .setCustomId('answer_modal_' + questionId + '_' + lesson + '_' + messageId)
        .setTitle('Atbilde');

    const favoriteColorInput = new TextInputBuilder()
        .setCustomId('answer_to_question')
        .setLabel('Ievadi savu atbildi')
        .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);

    modal.addComponents(firstActionRow);

    return modal;
}

async function lessonFinishedEmbed(userId, channelId) {
    const topEmbed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Treniņš pabeigts')
        .setDescription("Tu esi pabeidzis treniņu, šeit ir tava atbilžu vēsture. Spied uz pogas 'Beigt treniņu' lai aizvērtu šo channel pa visam šo treniņu.")
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

    const answers = await Database.getActiveLessonHistory(userId, channelId);
    const lesson = await Database.getActiveLessonByChannel(channelId);

    let message = "";

    let question1 = 0;
    let totalPoints = 0;
    let answersRight = 0;
    const fromAnswers = answers.length;

    message += "⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯";

    for (const answer of answers) {
        question1++;
        const emoji = answer.correct ? "🟢" : "🔴";
        const question = await Database.getQuestionFromId(lesson.type, answer.questionId);
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

    const topEmbed2 = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle('Atbilžu vēsture')
        .setDescription(message)
        .setTimestamp()
        .setFooter({ text: 'Eksāmenu palīgs' });

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

module.exports = {
    createStartLessonEmbed,
    createQuestionEmbed,
    createAnswerModal,
    lessonFinishedEmbed,
    createStartLessonEmbed,
};