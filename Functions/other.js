const moment = require('moment');
const JSONdb = require('simple-json-db');
const usersDatabase = new JSONdb('./Database/users.json');
const lessonsDatabase = new JSONdb('./Database/lessons.json');
const activeLessonsDatabase = new JSONdb('./Database/activeLessons.json');
const booksDatabase = new JSONdb('./Database/books.json');

function formatTime(time) {
    return moment(time).fromNow().replace(' ago', '');
}

module.exports = { formatTime, usersDatabase, lessonsDatabase, activeLessonsDatabase, booksDatabase}