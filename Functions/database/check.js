const moment = require('moment');
const JSONdb = require('simple-json-db');
const { usersDatabase, lessonsDatabase, activeLessonsDatabase, booksDatabase } = require('../utils.js');
const { getQuestionFromId } = require('./get');

function canUserBuyHint(userId, lesson, questionId) {
    let user = getUser(userId)
    let hint = getHint(lesson, questionId)
    return user.coins >= hint.cost
}

function checkAnswer(lesson, questionId, answer) {
    let lessons = lessonsDatabase.get('lessons') || []
    if (lessons[lesson].questions.find(question => question.id === questionId).type === 'text') {
        let correctAnswers = lessons[lesson].questions.find(question => question.id === questionId)
        for (let correctAnswer of correctAnswers.answers) {
            if (answer === correctAnswer.toString()) {
                return true
            }
        }
    } else {
        let correctAnswers = lessons[lesson].questions.find(question => question.id === questionId)
        for (let correctAnswer of correctAnswers.select) {
            if (correctAnswer.id === answer) {
                let key = Object.keys(correctAnswer)[0];
                let value = correctAnswer[key]
                console.log(value)
                return value
            }
        }
    }
    return false
}

function canUseHint(userId, lessonName, questionId) {
    let question = getQuestionFromId(lessonName, questionId)
    let hint = question.hint
    return hint.enabled
}

function isThisChannelLessonActive(channelId) {
    let activeLessons = getActiveLessons()
    return activeLessons.find(lesson => lesson.channelId === channelId) ? true : false
}

function doesUserHaveEnoughCoins(userId, coins) {
    let user = getUser(userId)
    return user.coins >= coins
}

module.exports = {
    canUserBuyHint,
    checkAnswer,
    canUseHint,
    isThisChannelLessonActive,
    doesUserHaveEnoughCoins
}