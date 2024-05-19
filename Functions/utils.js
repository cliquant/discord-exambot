const moment = require('moment');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

function formatTime(time) {
    return moment(time).fromNow().replace(' ago', '');
}

module.exports = { formatTime, db }