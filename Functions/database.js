const { clear } = require('console');
const { get } = require('lodash');
const { start } = require('repl');
const JSONdb = require('simple-json-db');
const usersDatabase = new JSONdb('./Database/users.json');
const lessonsDatabase = new JSONdb('./Database/lessons.json');
const activeLessonsDatabase = new JSONdb('./Database/activeLessons.json');

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

    if (!activeLessonsDatabase.has('lessons')) {
        activeLessonsDatabase.set('lessons', []);
        activeLessonsDatabase.sync();
    }

    if (!lessonsDatabase.has('lessons')) {
        console.log('[DATABASE] Adding default lessons and questions...')
        const defaultQuestions = {
            "math": {
                "title": "Matemātika",
                "questions": [
                    {
                        "question": "Cik ir 2+2?",
                        "answers": [4, "četri", "četrpadsmit", "4", "four", "fourteen"]
                    },
                    {
                        "question": "Cik ir 2*2?",
                        "answers": [4, "četri", "četrpadsmit", "4", "four", "fourteen"]
                    },
                    {
                        "question": "Cik ir 2-2?",
                        "answers": [0, "nulle", "zero"]
                    },
                    {
                        "question": "Cik ir 2/2?",
                        "answers": [1, "viens", "one"]
                    }
                ]
            },
            "latvian": {
                "title": "Latviešu valoda",
                "questions": [
                    {
                        "question": "Kā sauc valodu pieņemtā vārdu pareizrakstības sistēmā?",
                        "answers": ["Ortogrāfija"]
                    },
                    {
                        "question": "Kā sauc mācību par skaņām?",
                        "answers": ["Fonētika"]
                    },
                    {
                        "question": "Kā sauc izvilkumu no kādas personas runas vai kāda autora rakstīta teksta?",
                        "answers": ["Citāts"]
                    },
                    {
                        "question": "Kā sauc vārdu, kas apzīmē kādu priekšmetu, dzīvnieku, cilvēku, vietu, parādību, darbību, sajūtu, īpašību, attiecību, laiku, skaitu vai mērvienību?",
                        "answers": ["Substantīvs", "Lietvārds"]
                    }
                ]
            },
            "english": {
                "title": "Angļu valoda",
                "questions": [
                    {
                        "question": "What is the plural of 'child'?",
                        "answers": ["Children"]
                    },
                    {
                        "question": "What is the past tense of 'eat'?",
                        "answers": ["Ate"]
                    },
                    {
                        "question": "What is the present participle of 'run'?",
                        "answers": ["Running"]
                    },
                    {
                        "question": "What is the comparative form of 'good'?",
                        "answers": ["Better"]
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
    activeLessons.push({ userId: userId, channelId: channelId })
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


module.exports = { prepareDatabase, addUser, addUserCoins, getUser, getLessonsInArray, removeUserCoins, addLesson, addLessonPoint, updateAllUserLessons, getUsers, addToUserLesson, getActiveLessonCount, getActiveLessonByChannel, addActiveLesson }