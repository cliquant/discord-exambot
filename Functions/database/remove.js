const moment = require('moment');
const JSONdb = require('simple-json-db');
const usersDatabase = new JSONdb('./Database/users.json');
const activeLessonsDatabase = new JSONdb('./Database/activeLessons.json');
const { getLessonsInArray, getUser, getUsers, getActiveLessons } = require('./get');

function deleteActiveLesson(channelId) {
    let activeLessons = getActiveLessons()
    let lessonIndex = activeLessons.findIndex(lesson => lesson.channelId === channelId)
    activeLessons.splice(lessonIndex, 1)
    activeLessonsDatabase.set('activeLessons', activeLessons)
    activeLessonsDatabase.sync()
}

function removeUserCoins(userId, points) {
    let users = usersDatabase.get('users') || []
    let user = users.find(user => user.id === userId)
    user.coins -= points
    usersDatabase.set('users', users)
    usersDatabase.sync()
}

function removeActiveLesson(userId, channelId) {
    let activeLessons = getActiveLessons()
    if (activeLessons.find(lesson => lesson.userId === userId && lesson.channelId === channelId)) {
        deleteActiveLesson(channelId)
    }
}

function deleteTrainingLesson(lessonId) {
    let lessons = getLessonsInArray()
    let lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId)
    if (lessonIndex === -1) return
    lessons.splice(lessonIndex, 1)
    lessonsDatabase.set('lessons', lessons)
    lessonsDatabase.sync()
}

function deleteTrainingQuestion(lesson, questionId) {
    let lessons = getLessonsInArray()
    let lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId)
    if (lessonIndex === -1) return
    let questionIndex = lessons[lessonIndex].questions.findIndex(question => question.id === questionId)
    if (questionIndex === -1) return
    lessons[lessonIndex].questions.splice(questionIndex, 1)
    lessonsDatabase.set('lessons', lessons)
    lessonsDatabase.sync()
}

module.exports = {
    removeUserCoins,
    removeActiveLesson,
    deleteActiveLesson,
    deleteTrainingLesson,
    deleteTrainingQuestion
}