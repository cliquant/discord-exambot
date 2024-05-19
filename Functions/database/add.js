const { db } = require('../utils');
const { getLessonsInArray, getUser, getUsers, getActiveLessons, getLessonQuestions } = require('./get');

function addUserCoins(userId, points) {
    db.serialize(() => {
        db.get('SELECT coins FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                console.error(err);
                return;
            }
            const newCoins = row.coins + points;
            db.run('UPDATE users SET coins = ? WHERE id = ?', [newCoins, userId]);
        });
    });
}

function changeAnswerTrueOrFalse(lessonId, questionId, answerId, answer) {
    getLessonQuestions(lessonId).then(questions => {
        const question = questions.find(q => q.id === questionId);
        question.select.forEach(answers => {
            if (answers[Object.keys(answers)[1]] === answerId) {
                booleanParse = answers[Object.keys(answers)[0]] === 'true' ? true : false;
                question.select[question.select.indexOf(answers)][Object.keys(answers)[0]] = booleanParse;
            }
        });
        db.run('UPDATE lessons SET questions = ? WHERE id = ?', [JSON.stringify(questions), lessonId]);
    });
}

function addTrainingQuestion(lessonId, question, answer, type, image) {
    image1 = image;
    if (image === 'none') {
        image1 = "";
    }
    getLessonQuestions(lessonId).then(questions => {
        const questionId = questions.length + 1;
        questions.push({ id: questionId, question, answers: [answer], type, image1 });
        db.run('UPDATE lessons SET questions = ? WHERE id = ?', [JSON.stringify(questions), lessonId]);
    });
}

function addActiveLesson(userId, channelId) {
    const timestamp = Date.now();
    db.run('INSERT INTO activeLessons (userId, channelId, startedAt, type, status) VALUES (?, ?, ?, ?, ?)', 
           [userId, channelId, timestamp, '', '']);
}

function updateAllUserLessons() {
    getLessonsInArray().then(lessons => {
        db.all('SELECT * FROM users', [], (err, users) => {
            if (err) {
                console.error(err);
                return;
            }
            users.forEach(user => {
                let userLessons = JSON.parse(user.lessons);
                lessons.forEach(lesson => {
                    if (!userLessons[lesson]) {
                        userLessons[lesson] = 0;
                    }
                });
                db.run('UPDATE users SET lessons = ? WHERE id = ?', [JSON.stringify(userLessons), user.id]);
            });
        });
    });
}

function addToUserLesson(userId, lessonName) {
    db.get('SELECT lessons FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        let userLessons = JSON.parse(row.lessons);
        if (!userLessons[lessonName]) {
            userLessons[lessonName] = 0;
            db.run('UPDATE users SET lessons = ? WHERE id = ?', [JSON.stringify(userLessons), userId]);
        }
    });
}

function addLesson(lesson) {
    db.run('INSERT INTO lessons (id, title, type, questions) VALUES (?, ?, ?, ?)', 
           [lesson.id, lesson.title, lesson.type, JSON.stringify(lesson.questions)], (err) => {
        if (err) {
            console.error('[DATABASE] Lesson with key already exists.');
        }
    });
}

function addLessonPoint(userId, lessonName, points) {
    db.get('SELECT lessons FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        let userLessons = JSON.parse(row.lessons);
        userLessons[lessonName] += points;
        db.run('UPDATE users SET lessons = ? WHERE id = ?', [JSON.stringify(userLessons), userId]);
    });
}

function setActiveLessonType(channelId, type, firstid) {
    db.run('UPDATE activeLessons SET type = ?, questionId = ?, status = ? WHERE channelId = ?', 
           [type, firstid, 'training', channelId]);
}

function addActiveLessonHistoryAnswer(userId, channelId, lesson, questionId, answer, correct) {
    db.get('SELECT answerHistory FROM activeLessons WHERE userId = ? AND channelId = ?', [userId, channelId], (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        let answerHistory = JSON.parse(row.answerHistory || '[]');
        let reward = getQuestionFromId(lesson, questionId).reward;
        if (!correct) reward = 0;
        answerHistory.push({ questionId, answer, correct, reward });
        db.run('UPDATE activeLessons SET answerHistory = ? WHERE userId = ? AND channelId = ?', 
               [JSON.stringify(answerHistory), userId, channelId]);
    });
}

function addToUserHistoryALesson(userId, lesson) {
    db.get('SELECT lessonsHistory FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        let lessonsHistory = JSON.parse(row.lessonsHistory || '[]');
        lessonsHistory.push(lesson);
        db.run('UPDATE users SET lessonsHistory = ? WHERE id = ?', [JSON.stringify(lessonsHistory), userId]);
    });
}

function setLastTimeCreatedTraining(userId) {
    const timestamp = Date.now();
    db.run('UPDATE users SET lastTrainingTime = ? WHERE id = ?', [timestamp, userId]);
}

function addToUserLessonPoints(userId, lessonName, points) {
    db.get('SELECT lessons FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error(err);
            return;
        }
        let userLessons = JSON.parse(row.lessons);
        userLessons[lessonName] += points;
        db.run('UPDATE users SET lessons = ? WHERE id = ?', [JSON.stringify(userLessons), userId]);
    });
}

function setStopTimeForActiveLesson(channelId) {
    const timestamp = Date.now();
    db.run('UPDATE activeLessons SET stoppedAt = ? WHERE channelId = ?', [timestamp, channelId]);
}

function addUser(userId) {
    const lessonsForExample = {};
    getLessonsInArray().then(lessons => {
        lessons.forEach(lesson => {
            lessonsForExample[lesson] = 0;
        });

        const userExample = { 
            id: userId,
            coins: 5,
            lessonsHistory: [],
            lastTrainingTime: 0,
            lessons: lessonsForExample
        };

        db.run('INSERT INTO users (id, coins, lessonsHistory, lastTrainingTime, lessons) VALUES (?, ?, ?, ?, ?)', 
               [userExample.id, userExample.coins, JSON.stringify(userExample.lessonsHistory), 
                userExample.lastTrainingTime, JSON.stringify(userExample.lessons)]);
    });
}

function addTrainingLesson(title, type, id) {
    const lesson = {
        id,
        title,
        type,
        questions: []
    };
    db.run('INSERT INTO lessons (id, title, type, questions) VALUES (?, ?, ?, ?)', 
           [lesson.id, lesson.title, lesson.type, JSON.stringify(lesson.questions)]);
}

function renameTrainingLessonTitle(lessonId, title) {
    db.run('UPDATE lessons SET title = ? WHERE id = ?', [title, lessonId]);
}

function changeTypeOfQuestion(lessonId, questionId, type) {
    getLessonQuestions(lessonId).then(questions => {
        const question = questions.find(q => q.id === questionId);
        question.type = type;
        db.run('UPDATE lessons SET questions = ? WHERE id = ?', [JSON.stringify(questions), lessonId]);
    });
}

function editTrainingQuestionAnswers(lessonId, questionId, answers, type) {
    getLessonQuestions(lessonId).then(questions => {
        const question = questions.find(q => q.id === questionId);
        if (type === 'text') {
            question.answers = [answers];
        } else {
            question.select = answers;
        }
        db.run('UPDATE lessons SET questions = ? WHERE id = ?', [JSON.stringify(questions), lessonId]);
    });
}

function editTrainingQuestionAnswer(lessonId, questionId, answerId, answer, type) {
    getLessonQuestions(lessonId).then(questions => {
        const question = questions.find(q => q.id === questionId);
        if (type === 'text') {
            question.answers[answerId - 1] = answer;
        } else {
            const answerIndex = question.select.findIndex(a => a.id === answerId);
            question.select[answerIndex] = answer;
        }
        db.run('UPDATE lessons SET questions = ? WHERE id = ?', [JSON.stringify(questions), lessonId]);
    });
}

module.exports = {
    addUserCoins,
    updateAllUserLessons,
    addToUserLesson,
    addLesson,
    addLessonPoint,
    addActiveLesson,
    setActiveLessonType,
    addActiveLessonHistoryAnswer,
    setStopTimeForActiveLesson,
    addToUserHistoryALesson,
    setLastTimeCreatedTraining,
    addToUserLessonPoints,
    addUser,
    addTrainingLesson,
    renameTrainingLessonTitle,
    changeTypeOfQuestion,
    editTrainingQuestionAnswers,
    addTrainingQuestion,
    changeAnswerTrueOrFalse,
    editTrainingQuestionAnswer
};
