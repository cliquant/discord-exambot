
const moment = require('moment');
const { usersDatabase, lessonsDatabase, activeLessonsDatabase, booksDatabase } = require('../other.js');
const { updateAllUserLessons } = require('./add');

const defaultBooks = [
    {
        "id": "math",
        "title": "Matemātika",
        "topics": [
            {
                "id": "addition",
                "title": "Saskaitīšana",
                "content": "Saskaitīšana ir matemātikas operācija, kurā divi vai vairāki skaitļi tiek apvienoti vienā skaitlī, ko sauc par summu. ```2 + 3 = 5```"
            },
            {
                "id": "subtraction",
                "title": "Atnemšana",
                "content": "Atnemšana ir matemātikas operācija, kurā viens skaitlis tiek atņemts no cita skaitļa, lai iegūtu atlikumu. ```5 - 3 = 2```"
            },
            {
                "id": "multiplication",
                "title": "Reizināšana",
                "content": "Reizināšana ir matemātikas operācija, kurā divi vai vairāki skaitļi tiek apvienoti vienā skaitlī, ko sauc par reizinājumu. ```2 * 3 = 6 | (2+2+2=6)```"
            },
            {
                "id": "division",
                "title": "Dalīšana",
                "content": "Dalīšana ir matemātikas operācija, kurā viens skaitlis tiek sadalīts citā skaitlī, lai iegūtu kvocientu. ```6 / 3 = 2```"
            }
        ]
    }
]

const defaultQuestions = {
    "math": {
        "title": "Matemātika",
        "questions": [
            {
                "id": "math1",
                "image": "none",
                "question": "Cik ir 2+2?",
                "image": "https://i.imgur.com/1zQ1Q9z.png",
                "type": "select",
                "answers": [],
                "select": [{"4": true, "id": "answer1"}, {"5": false, "id": "answer2"}],
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

function startTimers() {
    setInterval(() => {
        updateAllUserLessons()
    }, 500);
}

async function prepareDatabase() {
    console.log('[DATABASE] Preparing database...')

    if (!usersDatabase.has('users')) {
        const defaultUsers = []
        usersDatabase.set('users', defaultUsers);
        usersDatabase.sync();
    }

    if (!booksDatabase.has('books')) {
        console.log('[DATABASE] Adding default books...')

        booksDatabase.set('books', defaultBooks);
        booksDatabase.sync();
    }

    if (!activeLessonsDatabase.has('activeLessons')) {
        activeLessonsDatabase.set('activeLessons', []);
        activeLessonsDatabase.sync();
    }

    if (!lessonsDatabase.has('lessons')) {
        console.log('[DATABASE] Adding default lessons and questions...')

        lessonsDatabase.set('lessons', defaultQuestions);
        lessonsDatabase.sync();
    }
}

module.exports = {
    prepareDatabase,
    startTimers,
    usersDatabase,
    lessonsDatabase,
    activeLessonsDatabase,
    booksDatabase
}