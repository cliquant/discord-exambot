const moment = require('moment');
const JSONdb = require('simple-json-db');
const { usersDatabase, lessonsDatabase, activeLessonsDatabase, booksDatabase } = require('../other.js');

function getLessonsInArray() {
    let lessons = lessonsDatabase.get('lessons') || []
    let lessonsKeyArray = []
    for (let key in lessons) {
        lessonsKeyArray.push(key)
    }
    
    return lessonsKeyArray
}

function getUsers() {
    return usersDatabase.get('users') || []
}

function getTop5Users(lessonName) {
    let users = getUsers();
    let userIdsWithPoints = []

    users.forEach(user => {
        let userPoints = user.lessons[lessonName]
        userIdsWithPoints.push({ userId: user.id, points: userPoints })
    })

    userIdsWithPoints.sort((a, b) => b.points - a.points)

    return userIdsWithPoints.slice(0, 5)
}

function getUserPointsInLesson(userId, lessonName) {
    let user = getUser(userId)
    return user.lessons[lessonName]
}

function getTitleFromLessonId(lessonId) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[lessonId].title
}

function getUserActiveLessonCount(userId) {
    let activeLessons = getActiveLessons()
    return activeLessons.filter(lesson => lesson.userId === userId).length
}

function getUser(userId) {
    let users = usersDatabase.get('users') || []
    return users.find(user => user.id === userId)
}

function getLessonQuestionCount(lessonName) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[lessonName].questions.length
}

function getLessonQuestions(lessonName) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[lessonName].questions
}

function getActiveLessons() {
    return activeLessonsDatabase.get('activeLessons') || []
}

function getActiveLessonCount() {
    return getActiveLessons().length || 0
}

function getActiveLessonByChannel(channelId) {
    let activeLessons = getActiveLessons()
    return activeLessons.find(lesson => lesson.channelId === channelId)
}

function getQuestionFromId(lessonName, questionId) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[lessonName].questions.find(question => question.id === questionId)
}

function getAnswerFromId(lessonName, questionId) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[lessonName].questions.find(question => question.id === questionId).answers[0]
}

function getHintFromId(lessonName, questionId) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[lessonName].questions.find(question => question.id === questionId).hint.question
}

function getTrainingLessonById(id) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[id] || null
}

function getLessonFirstQuestionId(lessonName) {
    let questions = getLessonQuestions(lessonName)
    return questions[0].id
}

function getLessonNextQuestionId(userId, channelId, lessonName, currentQuestionId) {
    let user = getUser(userId);
    let lesson = user.lessons[lessonName];
    let questions = getLessonQuestions(lessonName);
    let questionIndex = questions.findIndex(question => question.id === currentQuestionId);

    if (questionIndex === -1) {
        throw new Error('Current question not found in the list.');
    }

    let nextQuestion = questions[questionIndex + 1];

    if (!nextQuestion) {
        return 'there_is_no_more_questions';
    }

    let questionId = nextQuestion.id;
    let activeLessons = getActiveLessons();
    let lessonIndex = activeLessons.findIndex(lesson => lesson.channelId === channelId);

    if (lessonIndex === -1) {
        throw new Error('Lesson not found in active lessons.');
    }

    activeLessons[lessonIndex].questionId = questionId;
    activeLessonsDatabase.set('activeLessons', activeLessons);
    activeLessonsDatabase.sync();

    return questionId;
}

function getLessonQuestionFromId(lessonName, questionId) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[lessonName].questions.find(question => question.id === questionId)
}

function getBookLessonTitleFromId(bookId) {
    let books = booksDatabase.get('books') || []
    return books[bookId].title
}

function getBookLessonsIdsInArray() {
    let books = booksDatabase.get('books') || []
    let bookIds = []
    for (let key in books) {
        bookIds.push(key)
    }
    return bookIds
}

function getBookContent(topic, bookId) {
    let books = booksDatabase.get('books') || []
    return books[topic].id[bookId].content
}

function getTopicIdsInArray(topic) {
    let books = booksDatabase.get('books') || []
    let bookIds = []
    for (let key in books[topic].topics) {
        bookIds.push(books[topic].topics[key].id)
    }
    return bookIds
}

function getTopicTitleFromId(lesson, topic) {
    let books = booksDatabase.get('books') || []
    for (let key in books[lesson].topics) {
        if (books[lesson].topics[key].id === topic) {
            return books[lesson].topics[key].title
        }
    }
}

function getTopicContentFromId(lesson, topic) {
    let books = booksDatabase.get('books') || []
    for (let key in books[lesson].topics) {
        if (books[lesson].topics[key].id === topic) {
            return books[lesson].topics[key].content
        }
    }
}

function getActiveLessonUsersByType(type) {
    let activeLessons = getActiveLessons()
    let users = []
    activeLessons.forEach(lesson => {
        if (lesson.type === type) {
            users.push([lesson.userId, lesson.channelId, lesson.questionId])
        }
    })
    return users
}

function getStartedAt(userId, channelId) {
    let activeLessons = getActiveLessons()
    let lesson = activeLessons.find(lesson => lesson.userId === userId && lesson.channelId === channelId)
    return lesson.startedAt
}

function getActiveLessonHistory(userId, channelId) {
    let activeLessons = getActiveLessons()
    let lessonIndex = activeLessons.findIndex(lesson => lesson.userId === userId && lesson.channelId === channelId)
    return activeLessons[lessonIndex].answerHistory || []
}

function getUserHistoryLessonInSpecificLesson(userId, lesson) {
    let users = getUsers();
    let user = getUser(userId);
    let userHistory = user.lessonsHistory || []
    let lessonHistory = userHistory.filter(history => history.type === lesson)
    return lessonHistory || []
}

function getUserLastLessonCreate(userId) {
    let users = getUsers();
    let user = getUser(userId);
    return user.lastTrainingTime || 0
}

function getLastTimeCreatedTraining(userId) {
    let users = getUsers();
    let user = getUser(userId);
    return user.lastTrainingTime || 0
}

function getActiveLessonRewardCountTotal(userId, channelId) {
    let activeLessons = getActiveLessons()
    let lessonIndex = activeLessons.findIndex(lesson => lesson.userId === userId && lesson.channelId === channelId)
    let answerHistory = activeLessons[lessonIndex].answerHistory || []
    let total = 0
    answerHistory.forEach(answer => {
        total += answer.reward
    })
    return total
}

function getHint(lesson, questionId) {
    let question = getQuestionFromId(lesson, questionId)
    let hint = question.hint
    return hint
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
    getTrainingLessonById
}