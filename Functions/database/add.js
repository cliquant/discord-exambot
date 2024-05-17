const moment = require('moment');
const JSONdb = require('simple-json-db');
const { usersDatabase, lessonsDatabase, activeLessonsDatabase, booksDatabase } = require('../utils.js');
const { getLessonsInArray, getUser, getUsers, getActiveLessons } = require('./get');

function addUserCoins(userId, points) {
    let users = usersDatabase.get('users') || []
    let user = users.find(user => user.id === userId)
    user.coins += points
    usersDatabase.set('users', users)
    usersDatabase.sync()
}

function addActiveLesson(userId, channelId) {
    let activeLessons = activeLessonsDatabase.get('activeLessons') || []
    let date = new Date()
    let timestamp = date.getTime()
    activeLessons.push({ userId: userId, channelId: channelId, startedAt: timestamp, type: '' })
    activeLessonsDatabase.set('activeLessons', activeLessons)
    activeLessonsDatabase.sync()
}

function updateAllUserLessons() {
    lessonanmes = getLessonsInArray()
    let users = usersDatabase.get('users') || []
    users.forEach(user => {
        let userLessons = user.lessons
        for (let lesson of lessonanmes) {
            if (userLessons[lesson] === undefined) {
                userLessons[lesson] = 0
                addToUserLesson(user.id, lesson)
            }
        }
    })
}

function addToUserLesson(userId, lessonName) {
    console.log(`[DATABASE] Adding lesson ${lessonName} to user ${userId}.`)
    let users = usersDatabase.get('users') || []
    let user = users.find(user => user.id === userId)
    let userLessons = user.lessons
    if (!userLessons[lessonName]) {
        userLessons[lessonName] = 0
    }
    usersDatabase.set('users', users)
    usersDatabase.sync()
}

function addLesson(lesson) {
    let lessons = lessonsDatabase.get('lessons') || []
    let lessonKey = Object.keys(lesson)[0]
    if (!lessons[lessonKey]) {
        lessons[lessonKey] = lesson[lessonKey]
        lessonsDatabase.set('lessons', lessons)
        lessonsDatabase.sync()
    } else {
        console.log(`[DATABASE] Lesson with key ${lessonKey} already exists.`)
    }
}

function addLessonPoint(userId, lessonName, points) {
    let users = usersDatabase.get('users') || []
    let user = users.find(user => user.id === userId)
    let userLessons = user.lessons
    let lesson = userLessons.find(lesson => lesson[lessonName])
    lesson[lessonName] += points
    usersDatabase.set('users', users)
    usersDatabase.sync()
}

function setActiveLessonType(channelId, type, firstid) {
    let activeLessons = getActiveLessons()
    let lessonIndex = activeLessons.findIndex(lesson => lesson.channelId === channelId)
    activeLessons[lessonIndex].type = type
    activeLessons[lessonIndex].questionId = firstid
    activeLessons[lessonIndex].status = 'training'
    activeLessonsDatabase.set('activeLessons', activeLessons)
    activeLessonsDatabase.sync()
}

function addActiveLessonHistoryAnswer(userId, channelId, lesson, questionId, answer, correct) {
    let activeLessons = getActiveLessons()
    let lessonIndex = activeLessons.findIndex(lesson => lesson.userId === userId && lesson.channelId === channelId)
    let answerHistory = activeLessons[lessonIndex].answerHistory || []
    let reward = lessonsDatabase.get('lessons')[lesson].questions.find(question => question.id === questionId).reward
    if (!correct) {
        reward = 0
    }
    answerHistory.push({ questionId: questionId, answer: answer, correct: correct, reward: reward })
    activeLessons[lessonIndex].answerHistory = answerHistory
    activeLessonsDatabase.set('activeLessons', activeLessons)
    activeLessonsDatabase.sync()
}

function addToUserHistoryALesson(userId, lesson) {
    let users = getUsers();
    let user = getUser(userId);

    if (!Array.isArray(user.lessonsHistory)) {
        user.lessonsHistory = [];
    }

    user.lessonsHistory.push(lesson);

    usersDatabase.set('users', users);
    usersDatabase.sync();
}

function setLastTimeCreatedTraining(userId) {
    let users = getUsers();
    let user = getUser(userId);
    let date = new Date()
    let timestamp = date.getTime()
    user.lastTrainingTime = timestamp
    usersDatabase.set('users', users)
    usersDatabase.sync()
}

function addToUserLessonPoints(userId, lessonName, points) {
    let users = usersDatabase.get('users') || []
    let user = users.find(user => user.id === userId)
    let userLessons = user.lessons
    userLessons[lessonName] += points
    usersDatabase.set('users', users)
    usersDatabase.sync()
}

function setStopTimeForActiveLesson(channelId) {
    let activeLessons = getActiveLessons()
    let lessonIndex = activeLessons.findIndex(lesson => lesson.channelId === channelId)
    let date = new Date()
    let timestamp = date.getTime()
    activeLessons[lessonIndex].stoppedAt = timestamp
    activeLessonsDatabase.set('activeLessons', activeLessons)
    activeLessonsDatabase.sync()
}

function addUser(userId) {
    let lessonsForExample = {}
    let lessonsAvailable = getLessonsInArray()
    for (let lesson of lessonsAvailable) {
        lessonsForExample[lesson] = 0
    }

    const userExample = { 
        id: userId,
        coins: 5,
        lessonsHistory: [],
        lastTrainingTime: 0,
        lessons: lessonsForExample
    }

    let users = usersDatabase.get('users') || []
    
    if (!users.find(user => user.id === userId)) {
        users.push(userExample);
        usersDatabase.set('users', users);
        usersDatabase.sync();
    }
}

function addTrainingLesson(title, type, id) {
    let lessons = lessonsDatabase.get('lessons') || []
    let lesson = {
        title: title,
        type: type,
        id: id,
        questions: []
    }
    lessons.push(lesson)
    lessonsDatabase.set('lessons', lessons)
    lessonsDatabase.sync()
}

function renameTrainingLessonTitle(lessonId, title) {
    let lessons = lessonsDatabase.get('lessons') || []
    let lesson = lessons[lessonId]
    lesson.title = title
    lessonsDatabase.set('lessons', lessons)
    lessonsDatabase.sync()
}

function changeTypeOfQuestion(lessonId, questionId, type) {
    let lessons = lessonsDatabase.get('lessons') || []
    let lesson = lessons[lessonId]
    let question = lesson.questions.find(question => question.id === questionId)
    question.type = type
    lessonsDatabase.set('lessons', lessons)
    lessonsDatabase.sync()
}

function editTrainingQuestionAnswers(lessonId, questionId, answers, type) {
    let lessons = lessonsDatabase.get('lessons') || []
    let lesson = lessons[lessonId]
    let question = lesson.questions.find(question => question.id === questionId)
    if (type === 'text') {
        // edit question.answers
        question.answers = [answers]
    } else {
        question.select = answers
    }
    lessonsDatabase.set('lessons', lessons)
    lessonsDatabase.sync()
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
    editTrainingQuestionAnswers
}