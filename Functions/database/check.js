const { db } = require('../utils');
const { getQuestionFromId } = require('./get');

function canUserBuyHint(userId, lesson, questionId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT coins FROM users WHERE id = ?', [userId], (err, userRow) => {
            if (err) return reject(err);
            db.get('SELECT questions FROM lessons WHERE id = ?', [lesson], (err, lessonRow) => {
                if (err) return reject(err);
                const questions = JSON.parse(lessonRow.questions);
                const question = questions.find(q => q.id === questionId);
                resolve(userRow.coins >= question.hint.cost);
            });
        });
    });
}

function checkAnswer(lesson, questionId, answer) {
    return new Promise((resolve, reject) => {
        db.get('SELECT questions FROM lessons WHERE id = ?', [lesson], (err, row) => {
            if (err) return reject(err);
            const questions = JSON.parse(row.questions);
            const question = questions.find(q => q.id === questionId);

            if (!question) {
                return reject(new Error('Question not found'));
            }

            if (question.type === 'text') {
                const answerStr = String(answer).toLowerCase();
                if (!Array.isArray(question.answers)) {
                    return reject(new Error('Answers is not an array'));
                }
                const isCorrect = question.answers.some(correctAnswer => typeof correctAnswer === 'string' && correctAnswer.toLowerCase() === answerStr);
                resolve(isCorrect);
            } else {
                if (!Array.isArray(question.select)) {
                    return reject(new Error('Select is not an array'));
                }
                const correctAnswer = question.select.find(a => {
                    return a['id'] === answer && a[Object.keys(a)[0]] == true
                });
                resolve(correctAnswer !== undefined);
            }
        });
    });
}

function canUseHint(userId, lessonName, questionId) {
    return getQuestionFromId(lessonName, questionId).then(question => question.hint.enabled);
}

function isThisChannelLessonActive(channelId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM activeLessons WHERE channelId = ?', [channelId], (err, row) => {
            if (err) return reject(err);
            resolve(row.count > 0);
        });
    });
}

function doesUserHaveEnoughCoins(userId, coins) {
    return new Promise((resolve, reject) => {
        db.get('SELECT coins FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row.coins >= coins);
        });
    });
}

module.exports = {
    canUserBuyHint,
    checkAnswer,
    canUseHint,
    isThisChannelLessonActive,
    doesUserHaveEnoughCoins
};
