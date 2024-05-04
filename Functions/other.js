const moment = require('moment');

function formatTime(time) {
    return moment(time).fromNow().replace(' ago', '');
}

module.exports = { formatTime }