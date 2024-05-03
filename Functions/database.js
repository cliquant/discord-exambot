const moment = require('moment');
const JSONdb = require('simple-json-db');
const usersDatabase = new JSONdb('./Database/users.json');
const lessonsDatabase = new JSONdb('./Database/lessons.json');
const activeLessonsDatabase = new JSONdb('./Database/activeLessons.json');
const booksDatabase = new JSONdb('./Database/books.json');

function startTimers() {
    setInterval(() => {
        updateAllUserLessons()
    }, 500);
}

async function prepareDatabase() {
    console.log('[DATABASE] Preparing database...')

    if (!usersDatabase.has('users')) {
        usersDatabase.set('users', []);
        usersDatabase.sync();
    }

    if (!booksDatabase.has('books')) {
        console.log('[DATABASE] Adding default books...')
        const defaultBooks = {}

        usersDatabase.set('users', defaultBooks);
        usersDatabase.sync();
    }

    if (!activeLessonsDatabase.has('activeLessons')) {
        activeLessonsDatabase.set('activeLessons', []);
        activeLessonsDatabase.sync();
    }

    if (!lessonsDatabase.has('lessons')) {
        console.log('[DATABASE] Adding default lessons and questions...')
        const defaultQuestions = {
            "math": {
                "title": "Matemātika",
                "questions": [
                    {
                        "id": "math1",
                        "image": "none",
                        "question": "Cik ir 2+2?",
                        "image": "https://i.imgur.com/1zQ1Q9z.png",
                        "type": "text",
                        "answers": [4, "četri", "četrpadsmit", "4", "four", "fourteen"],
                        "reward": 1,
                        "hint": {
                            "enabled": false,
                            "question": "Test hint",
                            "cost": 1,
                        }
                    },
                    {
                        "id": "math2",
                        "image": "none",
                        "question": "Cik ir 2*2?",
                        "type": "text",
                        "answers": [4, "četri", "četrpadsmit", "4", "four", "fourteen"],
                        "reward": 1,
                        "hint": {
                            "enabled": false,
                            "question": "Test hint",
                            "cost": 1,
                        }
                    },
                    {
                        "id": "math3",
                        "image": "none",
                        "question": "Cik ir 2-2?",
                        "type": "text",
                        "answers": [0, "nulle", "zero"],
                        "reward": 1,
                        "hint": {
                            "enabled": false,
                            "question": "Test hint",
                            "cost": 1,
                        }
                    },
                    {
                        "id": "math4",
                        "image": "none",
                        "question": "Cik ir 2/2?",
                        "type": "text",
                        "answers": [1, "viens", "one"],
                        "reward": 1,
                        "hint": {
                            "enabled": false,
                            "question": "Test hint",
                            "cost": 1,
                        }
                    }
                ]
            },
            "latvian": {
                "title": "Latviešu valoda",
                "questions": [
                    {
                        "id": "latvian1",
                        "image": "none",
                        "type": "text",
                        "question": "Kā sauc valodu pieņemtā vārdu pareizrakstības sistēmā?",
                        "answers": ["Ortogrāfija"],
                        "reward": 1,
                        "hint": {
                            "enabled": true,
                            "question": "Test hint",
                            "cost": 1,
                        }
                    },
                    {
                        "id": "latvian2",
                        "type": "text",
                        "image": "none",
                        "question": "Kā sauc mācību par skaņām?",
                        "answers": ["Fonētika", "Mūzika"],
                        "reward": 1,
                        "hint": {
                            "enabled": false,
                            "question": "Test hint",
                            "cost": 1,
                        }
                    },
                    {
                        "id": "latvian3",
                        "type": "text",
                        "image": "none",
                        "question": "Kā sauc izvilkumu no kādas personas runas vai kāda autora rakstīta teksta?",
                        "answers": ["Citāts"],
                        "reward": 1,
                        "hint": {
                            "enabled": false,
                            "question": "Test hint",
                            "cost": 1,
                        }
                    },
                    {
                        "id": "latvian4",
                        "type": "text",
                        "image": "none",
                        "question": "Kā sauc vārdu, kas apzīmē kādu priekšmetu, dzīvnieku, cilvēku, vietu, parādību, darbību, sajūtu, īpašību, attiecību, laiku, skaitu vai mērvienību?",
                        "answers": ["Substantīvs", "Lietvārds"],
                        "reward": 1,
                        "hint": {
                            "enabled": false,
                            "question": "Test hint",
                            "cost": 1,
                        }
                    }
                ]
            },
            "english": {
                "title": "Angļu valoda",
                "questions": [
                    {
                        "id": "english1",
                        "type": "text",
                        "image": "none",
                        "question": "What is the plural of 'child'?",
                        "answers": ["Children"],
                        "reward": 1,
                        "hint": {
                            "enabled": false,
                            "question": "Test hint",
                            "cost": 1,
                        }
                    },
                    {
                        "id": "english2",
                        "type": "text",
                        "image": "none",
                        "question": "What is the past tense of 'eat'?",
                        "answers": ["Ate"],
                        "reward": 1,
                        "hint": {
                            "enabled": false,
                            "question": "Test hint",
                            "cost": 1,
                        }
                    },
                    {
                        "id": "english3",
                        "type": "text",
                        "image": "none",
                        "question": "What is the present participle of 'run'?",
                        "answers": ["Running"],
                        "reward": 1,
                        "hint": {
                            "enabled": false,
                            "question": "Test hint",
                            "cost": 1,
                        }
                    },
                    {
                        "id": "english4",
                        "type": "text",
                        "image": "none",
                        "question": "What is the comparative form of 'good'?",
                        "answers": ["Better"],
                        "reward": 1,
                        "hint": {
                            "enabled": false,
                            "question": "Test hint",
                            "cost": 1,
                        }
                    }
                ]
            }
        }

        lessonsDatabase.set('lessons', defaultQuestions);
        lessonsDatabase.sync();
    }

    startTimers()
}

function getLessonsInArray() {
    let lessons = lessonsDatabase.get('lessons') || []
    let lessonsKeyArray = []
    for (let key in lessons) {
        lessonsKeyArray.push(key)
    }
    
    return lessonsKeyArray
}

function addUser(userId) {
    let lessonsForExample = {}
    let lessonsAvailable = getLessonsInArray()
    for (let lesson of lessonsAvailable) {
        lessonsForExample[lesson] = 0
        console.log(lessonsForExample[lesson])
    }

    const userExample = { 
        id: userId,
        coins: 5,
        lessons: lessonsForExample
    }

    let users = usersDatabase.get('users') || []
    
    if (!users.find(user => user.id === userId)) {
        users.push(userExample);
        usersDatabase.set('users', users);
        usersDatabase.sync();
    }
}

function addUserCoins(userId, points) {
    let users = usersDatabase.get('users') || []
    let user = users.find(user => user.id === userId)
    user.coins += points
    usersDatabase.set('users', users)
    usersDatabase.sync()
}

function removeUserCoins(userId, points) {
    let users = usersDatabase.get('users') || []
    let user = users.find(user => user.id === userId)
    user.coins -= points
    usersDatabase.set('users', users)
    usersDatabase.sync()
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

function getUsers() {
    return usersDatabase.get('users') || []
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

function addActiveLesson(userId, channelId) {
    let activeLessons = activeLessonsDatabase.get('activeLessons') || []
    let date = new Date()
    let timestamp = date.getTime()
    activeLessons.push({ userId: userId, channelId: channelId, startedAt: timestamp, type: '' })
    activeLessonsDatabase.set('activeLessons', activeLessons)
    activeLessonsDatabase.sync()
}

function deleteActiveLesson(channelId) {
    let activeLessons = getActiveLessons()
    let lessonIndex = activeLessons.findIndex(lesson => lesson.channelId === channelId)
    activeLessons.splice(lessonIndex, 1)
    activeLessonsDatabase.set('activeLessons', activeLessons)
    activeLessonsDatabase.sync()
}

function isThisChannelLessonActive(channelId) {
    let activeLessons = getActiveLessons()
    return activeLessons.find(lesson => lesson.channelId === channelId) ? true : false
}

function getTitleFromLessonId(lessonId) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[lessonId].title
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

function doesUserHaveEnoughCoins(userId, coins) {
    let user = getUser(userId)
    return user.coins >= coins
}

function getUserActiveLessonCount(userId) {
    let activeLessons = getActiveLessons()
    return activeLessons.filter(lesson => lesson.userId === userId).length
}

function removeActiveLesson(userId, channelId) {
    let activeLessons = getActiveLessons()
    if (activeLessons.find(lesson => lesson.userId === userId && lesson.channelId === channelId)) {
        deleteActiveLesson(channelId)
    }
}

function setActiveLessonType(channelId, type, firstid) {
    let activeLessons = getActiveLessons()
    let lessonIndex = activeLessons.findIndex(lesson => lesson.channelId === channelId)
    activeLessons[lessonIndex].type = type
    activeLessons[lessonIndex].questionId = firstid
    activeLessonsDatabase.set('activeLessons', activeLessons)
    activeLessonsDatabase.sync()
}

function getQuestionFromId(lessonName, questionId) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[lessonName].questions.find(question => question.id === questionId)
}

function getAnswerFromId(lessonName, questionId) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[lessonName].questions.find(question => question.id === questionId).answers[0]
}

function canUseHint(userId, lessonName, questionId) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[lessonName].questions.find(question => question.id === questionId).hint.enabled
}

function getHintFromId(lessonName, questionId) {
    let lessons = lessonsDatabase.get('lessons') || []
    return lessons[lessonName].questions.find(question => question.id === questionId).hint
}

function getLessonFirstQuestionId(lessonName) {
    let questions = getLessonQuestions(lessonName)
    return questions[0].id
}

function getLessonNextQuestionId(userId, channelId, lessonName, currentQuestionId) {
    let user = getUser(userId)
    let userLessons = user.lessons
    let lesson = userLessons[lessonName]
    let questions = getLessonQuestions(lessonName)
    let questionIndex = questions.findIndex(question => question.id === currentQuestionId)
    let nextQuestion = questions[questionIndex + 1]
    let questionId = nextQuestion.id

    let activeLessons = getActiveLessons()
    let lessonIndex = activeLessons.findIndex(lesson => lesson.channelId === channelId)
    activeLessons[lessonIndex].questionId = questionId
    activeLessonsDatabase.set('activeLessons', activeLessons)
    activeLessonsDatabase.sync()

    return questionId
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

function formatTime(time) {
    return moment(time).fromNow().replace(' ago', '');
}


module.exports = { getLessonQuestionFromId, formatTime, getStartedAt, getActiveLessonUsersByType, getTopicContentFromId, getBookContent, getBookLessonsIdsInArray, getBookLessonTitleFromId, setActiveLessonType, removeActiveLesson, getUserActiveLessonCount, getTitleFromLessonId, prepareDatabase, addUser, addUserCoins, getUser, getLessonsInArray, removeUserCoins, addLesson, addLessonPoint, updateAllUserLessons, getUsers, addToUserLesson, getActiveLessonCount, getActiveLessonByChannel, addActiveLesson, deleteActiveLesson, isThisChannelLessonActive, getLessonQuestions, getTop5Users, getUserPointsInLesson, doesUserHaveEnoughCoins, getLessonQuestionCount, getActiveLessons, getQuestionFromId, getAnswerFromId, canUseHint, getHintFromId, getLessonFirstQuestionId, getLessonNextQuestionId, getTopicTitleFromId, getTopicIdsInArray}