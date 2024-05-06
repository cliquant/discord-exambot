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

module.exports = {
    removeUserCoins,
    removeActiveLesson,
    deleteActiveLesson
}