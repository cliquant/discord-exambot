const { db } = require('../utils');
const { getLessonsInArray, getUser, getUsers, getActiveLessons } = require('./get');

function deleteActiveLesson(channelId) {
    db.run('DELETE FROM activeLessons WHERE channelId = ?', [channelId]);
}

function removeUserCoins(userId, points) {
    db.serialize(() => {
        db.get('SELECT coins FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                console.error(err);
                return;
            }
            const newCoins = row.coins - points;
            db.run('UPDATE users SET coins = ? WHERE id = ?', [newCoins, userId]);
        });
    });
}

function removeActiveLesson(userId, channelId) {
    db.run('DELETE FROM activeLessons WHERE userId = ? AND channelId = ?', [userId, channelId]);
}

function deleteTrainingLesson(lessonId) {
    db.run('DELETE FROM lessons WHERE id = ?', [lessonId]);
}

function deleteTrainingQuestion(lessonId, questionId) {
    getLessonQuestions(lessonId).then(questions => {
        const updatedQuestions = questions.filter(q => q.id !== questionId);
        db.run('UPDATE lessons SET questions = ? WHERE id = ?', [JSON.stringify(updatedQuestions), lessonId]);
    });
}

function deleteTrainingQuestionAnswer(lessonId, questionId, answerId, type) {
    if (type == 'select') {
        getLessonQuestions(lessonId).then(questions => {
            const updatedQuestions = questions.map(q => {
                if (q.id == questionId) {
                    q.select.forEach(s => {
                        if (s.id == answerId) {
                            delete s;
                        }
                    });
                }
                return q;
            });
            db.run('UPDATE lessons SET questions = ? WHERE id = ?', [JSON.stringify(updatedQuestions), lessonId]);
        });
    } else {
        getLessonQuestions(lessonId).then(questions => {
            const updatedQuestions = questions.map(q => {
                if (q.id == questionId) {
                    delete q.answers[answerId];
                }
                return q;
            });
            db.run('UPDATE lessons SET questions = ? WHERE id = ?', [JSON.stringify(updatedQuestions), lessonId]);
        });
    }
}

function deleteBookTopic(id) {
    db.run('DELETE FROM books WHERE id = ?', [id]);
}


module.exports = {
    removeUserCoins,
    removeActiveLesson,
    deleteActiveLesson,
    deleteTrainingLesson,
    deleteTrainingQuestion,
    deleteTrainingQuestionAnswer,
    deleteBookTopic
};
