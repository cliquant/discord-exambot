const { db } = require('../utils');

function getLessonsInArray() {
    return new Promise((resolve, reject) => {
        db.all('SELECT id FROM lessons', [], (err, rows) => {
            if (err) return reject(err);
            const lessons = rows.map(row => row.id);
            resolve(lessons);
        });
    });
}

function getUsers() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users', [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getTop5Users(lessonName) {
    return new Promise((resolve, reject) => {
        db.all('SELECT id, lessons FROM users', [], (err, users) => {
            if (err) return reject(err);
            let userIdsWithPoints = users.map(user => ({
                userId: user.id,
                points: JSON.parse(user.lessons)[lessonName]
            }));
            userIdsWithPoints.sort((a, b) => b.points - a.points);
            resolve(userIdsWithPoints.slice(0, 5));
        });
    });
}

function getUserPointsInLesson(userId, lessonName) {
    return new Promise((resolve, reject) => {
        db.get('SELECT lessons FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) return reject(err);
            const userLessons = JSON.parse(row.lessons);
            resolve(userLessons[lessonName]);
        });
    });
}

function getTitleFromLessonId(lessonId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT title FROM lessons WHERE id = ?', [lessonId], (err, row) => {
            if (err) return reject(err);
            resolve(row.title);
        });
    });
}

function getUserActiveLessonCount(userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM activeLessons WHERE userId = ?', [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row.count);
        });
    });
}

function getUser(userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function getLessonQuestionCount(lessonName) {
    return new Promise((resolve, reject) => {
        db.get('SELECT questions FROM lessons WHERE id = ?', [lessonName], (err, row) => {
            if (err) return reject(err);
            const questions = JSON.parse(row.questions);
            resolve(questions.length);
        });
    });
}

function getLessonQuestions(lessonName) {
    return new Promise((resolve, reject) => {
        db.get('SELECT questions FROM lessons WHERE id = ?', [lessonName], (err, row) => {
            if (err) return reject(err);
            resolve(JSON.parse(row.questions));
        });
    });
}

function getActiveLessons() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM activeLessons', [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getActiveLessonCount() {
    return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM activeLessons', [], (err, row) => {
            if (err) return reject(err);
            resolve(row.count);
        });
    });
}

function getActiveLessonByChannel(channelId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM activeLessons WHERE channelId = ?', [channelId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function getQuestionFromId(lessonName, questionId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT questions FROM lessons WHERE id = ?', [lessonName], (err, row) => {
            if (err) return reject(err);
            const questions = JSON.parse(row.questions);
            resolve(questions.find(q => q.id === questionId));
        });
    });
}

function getAnswerFromId(lessonName, questionId) {
    return getQuestionFromId(lessonName, questionId).then(question => question.answers[0]);
}

function getHintFromId(lessonName, questionId) {
    return getQuestionFromId(lessonName, questionId).then(question => question.hint.question);
}

function getTrainingLessonById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM lessons WHERE id = ?', [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

function getLessonFirstQuestionId(lessonName) {
    return getLessonQuestions(lessonName).then(questions => {
        const question = questions.find(q => 
            (q.type === 'text' && q.answers.length > 0) || 
            (q.type === 'select' && q.select.some(option => Object.keys(option)[0] === 'true' || Object.keys(option)[0] === true))
        );
        return question ? question.id : 'there_is_no_questions';
    });
}

function getLessonNextQuestionId(userId, channelId, lessonName, currentQuestionId) {
    return new Promise((resolve, reject) => {
        getUser(userId).then(user => {
            getLessonQuestions(lessonName).then(questions => {
                const questionIndex = questions.findIndex(q => q.id === currentQuestionId);
                if (questionIndex === -1) return resolve('there_is_no_more_questions');

                let nextQuestionIndex = questionIndex + 1;
                while (nextQuestionIndex < questions.length) {
                    const nextQuestion = questions[nextQuestionIndex];
                    if ((nextQuestion.type === 'text' && nextQuestion.answers.length === 0) || 
                        (nextQuestion.type === 'select' && nextQuestion.select.length === 0)) {
                        nextQuestionIndex++;
                    } else {
                        break;
                    }
                }

                if (nextQuestionIndex >= questions.length) return resolve('there_is_no_more_questions');

                const nextQuestionId = questions[nextQuestionIndex].id;
                db.run('UPDATE activeLessons SET questionId = ? WHERE channelId = ?', [nextQuestionId, channelId], err => {
                    if (err) return reject(err);
                    resolve(nextQuestionId);
                });
            });
        });
    });
}

function getLessonQuestionFromId(lessonName, questionId) {
    return getQuestionFromId(lessonName, questionId);
}

function getBookLessonTitleFromId(bookId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT title FROM books WHERE id = ?', [bookId], (err, row) => {
            if (err) return reject(err);
            resolve(row.title);
        });
    });
}

function getBookLessonsIdsInArray() {
    return new Promise((resolve, reject) => {
        db.all('SELECT id FROM books', [], (err, rows) => {
            if (err) return reject(err);
            const bookIds = rows.map(row => row.id);
            if (bookIds.length === 0) return resolve([]);
            resolve(bookIds);
        });
    });
}

function getBookContent(topic, bookId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT topics FROM books WHERE id = ?', [bookId], (err, row) => {
            if (err) return reject(err);
            const book = JSON.parse(row.topics);
            const content = book.find(t => t.id === topic).content;
            resolve(content);
        });
    });
}

function getBooks() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM books', [], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getTopicIdsInArray(topic) {
    return new Promise((resolve, reject) => {
        db.get('SELECT topics FROM books WHERE id = ?', [topic], (err, row) => {
            if (err) return reject(err);
            const topics = JSON.parse(row.topics);
            const topicIds = topics.map(t => t.id);
            resolve(topicIds);
        });
    });
}

function getTopicTitleFromId(lesson, topic) {
    return new Promise((resolve, reject) => {
        db.get('SELECT topics FROM books WHERE id = ?', [lesson], (err, row) => {
            if (err) return reject(err);
            const topics = JSON.parse(row.topics);
            const topicTitle = topics.find(t => t.id === topic).title;
            resolve(topicTitle);
        });
    });
}

function getTopicContentFromId(lesson, topic) {
    return new Promise((resolve, reject) => {
        db.get('SELECT topics FROM books WHERE id = ?', [lesson], (err, row) => {
            if (err) return reject(err);
            const topics = JSON.parse(row.topics);
            const topicContent = topics.find(t => t.id === topic).content;
            resolve(topicContent);
        });
    });
}

function getActiveLessonUsersByType(type) {
    return new Promise((resolve, reject) => {
        db.all('SELECT userId, channelId, questionId FROM activeLessons WHERE type = ?', [type], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getStartedAt(userId, channelId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT startedAt FROM activeLessons WHERE userId = ? AND channelId = ?', [userId, channelId], (err, row) => {
            if (err) return reject(err);
            resolve(row.startedAt);
        });
    });
}

function getActiveLessonHistory(userId, channelId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT answerHistory FROM activeLessons WHERE userId = ? AND channelId = ?', [userId, channelId], (err, row) => {
            if (err) return reject(err);
            resolve(JSON.parse(row.answerHistory || '[]'));
        });
    });
}

function getUserHistoryLessonInSpecificLesson(userId, lesson) {
    return new Promise((resolve, reject) => {
        db.get('SELECT lessonsHistory FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) return reject(err);
            const lessonsHistory = JSON.parse(row.lessonsHistory || '[]');
            const lessonHistory = lessonsHistory.filter(history => history.type === lesson);
            resolve(lessonHistory);
        });
    });
}

function getUserLastLessonCreate(userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT lastTrainingTime FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row.lastTrainingTime);
        });
    });
}

function getLastTimeCreatedTraining(userId) {
    return getUserLastLessonCreate(userId);
}

function getActiveLessonRewardCountTotal(userId, channelId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT answerHistory FROM activeLessons WHERE userId = ? AND channelId = ?', [userId, channelId], (err, row) => {
            if (err) return reject(err);
            const answerHistory = JSON.parse(row.answerHistory || '[]');
            const total = answerHistory.reduce((acc, answer) => acc + answer.reward, 0);
            resolve(total);
        });
    });
}

function getHint(lesson, questionId) {
    return getQuestionFromId(lesson, questionId).then(question => question.hint);
}

function getTrainingLessonQuestionAnswers(lessonId, questionId) {
    return getQuestionFromId(lessonId, questionId).then(question => {
        if (question.type === 'text') {
            return question.answers;
        } else if (question.type === 'select') {
            return question.select;
        }
    });
}

function getTrainingLessonQuestionAnswer(lesson, questionId, answerId, type) {
    return new Promise((resolve, reject) => {
        db.get('SELECT questions FROM lessons WHERE id = ?', [lesson], (err, row) => {
            if (err) return reject(err);
            const questions = JSON.parse(row.questions);
            const question = questions.find(q => q.id === questionId);
            if (type === 'text') {
                resolve(question.answers[answerId - 1]);
            } else if (type === 'select') {
                resolve(question.select.find(a => a.id === answerId));
            }
        });
    });
}

function doesTrainingQuestionHaveHint(lesson, questionId) {
    return getQuestionFromId(lesson, questionId).then(question => {
        return question.hint !== undefined;
    });
}

function getBookTopicsInArray() {
    return new Promise((resolve, reject) => {
        db.all('SELECT topics FROM books', [], (err, rows) => {
            if (err) return reject(err);
            const topics = rows.map(row => JSON.parse(row.topics));
            resolve(topics);
        });
    });
}

module.exports = {
    getLessonsInArray,
    getUsers,
    getTop5Users,
    getUserPointsInLesson,
    getTitleFromLessonId,
    getUserActiveLessonCount,
    getUser,
    getLessonQuestionCount,
    getLessonQuestions,
    getActiveLessons,
    getActiveLessonCount,
    getActiveLessonByChannel,
    getQuestionFromId,
    getAnswerFromId,
    getHintFromId,
    getLessonFirstQuestionId,
    getLessonNextQuestionId,
    getLessonQuestionFromId,
    getBookLessonTitleFromId,
    getBookLessonsIdsInArray,
    getBookContent,
    getTopicIdsInArray,
    getTopicTitleFromId,
    getTopicContentFromId,
    getActiveLessonUsersByType,
    getStartedAt,
    getActiveLessonHistory,
    getUserHistoryLessonInSpecificLesson,
    getUserLastLessonCreate,
    getLastTimeCreatedTraining,
    getActiveLessonRewardCountTotal,
    getHint,
    getTrainingLessonById,
    getTrainingLessonQuestionAnswers,
    getTrainingLessonQuestionAnswer,
    doesTrainingQuestionHaveHint,
    getBookTopicsInArray,
    getBooks
};
