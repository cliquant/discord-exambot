const { db } = require('../utils');
const { updateAllUserLessons } = require('./add');

async function initializeDatabase() {
    await  db.serialize(async () => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            coins INTEGER,
            lessonsHistory TEXT,
            lastTrainingTime INTEGER,
            lessons TEXT
        )`);

        await db.run(`CREATE TABLE IF NOT EXISTS lessons (
            id TEXT PRIMARY KEY,
            title TEXT,
            type TEXT,
            questions TEXT
        )`);

        await db.run(`CREATE TABLE IF NOT EXISTS activeLessons (
            userId TEXT,
            channelId TEXT,
            startedAt INTEGER,
            type TEXT,
            questionId TEXT,
            stoppedAt INTEGER,
            status TEXT,
            answerHistory TEXT
        )`);

        await db.run(`CREATE TABLE IF NOT EXISTS books (
            id TEXT PRIMARY KEY,
            title TEXT,
            topics TEXT
        )`);
    });
}

async function prepareDatabase() {
    console.log('[DATABASE] Preparing database...');
    await initializeDatabase().then(async () => {
        console.log('[DATABASE] Database initialized!')
        await db.serialize(() => {
            db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
                if (err) {
                    console.error(err);
                    return;
                }
                if (row.count === 0) {
                    const defaultUsers = [];
                    const stmt = db.prepare('INSERT INTO users (id, coins, lessonsHistory, lastTrainingTime, lessons) VALUES (?, ?, ?, ?, ?)');
                    defaultUsers.forEach(user => {
                        stmt.run(user.id, user.coins, JSON.stringify(user.lessonsHistory), user.lastTrainingTime, JSON.stringify(user.lessons));
                    });
                    stmt.finalize();
                }
            });
    
            db.get('SELECT COUNT(*) as count FROM books', [], (err, row) => {
                if (err) {
                    console.error(err);
                    return;
                }
                if (row.count === 0) {
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
                    ];
                    const stmt = db.prepare('INSERT INTO books (id, title, topics) VALUES (?, ?, ?)');
                    defaultBooks.forEach(book => {
                        stmt.run(book.id, book.title, JSON.stringify(book.topics));
                    });
                    stmt.finalize();
                }
            });
    
            db.get('SELECT COUNT(*) as count FROM lessons', [], (err, row) => {
                if (err) {
                    console.error(err);
                    return;
                }
                if (row.count === 0) {
                    const defaultLessons = {
                        "math": {
                            "title": "Matemātika",
                            "questions": [
                                {
                                    "id": "math1",
                                    "question": "Aprēķini riņķa laukumu S, ja riņķis ievilkts kvadrātā, kura laukums ir 196 cm2!",
                                    "image": "https://i.imgur.com/I9Z6hXM.png",
                                    "type": "select",
                                    "answers": [],
                                    "select": [{"S=153,86π cm2": true, "id": "answer1"}, {"S=150π cm2": false, "id": "answer2"}],
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
                                    "question": "Četrstūra leņķu lielumi var būt 90°;100°;110°;60°.",
                                    "type": "select",
                                    "answers": [],
                                    "reward": 1,
                                    "select": [{"jā": true, "id": "answer1"}, {"nē": false, "id": "answer2"}],
                                    "hint": {
                                        "enabled": true,
                                        "question": "Piemērs: 1+1",
                                        "cost": 3,
                                    }
                                },
                                {
                                    "id": "math3",
                                    "image": "none",
                                    "question": "Cik ir 2-2?",
                                    "type": "text",
                                    "answers": [0, "", "nulle", "zero"],
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
                                    "answers": [1, "1", "viens", "one"],
                                    "reward": 1,
                                    "hint": {
                                        "enabled": false,
                                        "question": "Test hint",
                                        "cost": 1,
                                    }
                                },
                                {
                                    "id": "math5",
                                    "image": "none",
                                    "question": "Dota aritmētiskā progresija 9; 12; 15; 18; 21; .... \nAprēķini dotās aritmētiskās progresijas diferenci!",
                                    "type": "text",
                                    "answers": [3, "3", "trīs", "three"],
                                    "reward": 1,
                                    "hint": {
                                        "enabled": false,
                                        "question": "Test hint",
                                        "cost": 1,
                                    }
                                },
                                {
                                    "id": "math6",
                                    "image": "none",
                                    "question": "Dota aritmētiskā progresija: 3,8; 6; 8,2; 10,4; a5;a6;a7;a8;...;\nAprēķini dotās aritmētiskās progresijas diferenci!\nDiference ir...",
                                    "type": "text",
                                    "answers": [2.2, "2,2", "2.2"],
                                    "reward": 1,
                                    "hint": {
                                        "enabled": false,
                                        "question": "Test hint",
                                        "cost": 1,
                                    }
                                },
                                {
                                    "id": "math7",
                                    "image": "none",
                                    "question": "Parabolas y=−5x2 zari vērsti uz:",
                                    "type": "select",
                                    "select": [{"augšu": false, "id": "answer1"}, {"leju": true, "id": "answer2"}],
                                    "reward": 1,
                                    "hint": {
                                        "enabled": false,
                                        "question": "Test hint",
                                        "cost": 1,
                                    }
                                },
                                {
                                    "id": "math8",
                                    "image": "none",
                                    "question": "Kāda ir kvadrātsakne no 144?",
                                    "type": "text",
                                    "answers": [12, "12", "divpadsmit", "twelve"],
                                    "reward": 1,
                                    "hint": {
                                        "enabled": true,
                                        "question": "144/12",
                                        "cost": 1,
                                    }
                                },
                                {
                                    "id": "math9",
                                    "image": "https://i.imgur.com/SB3JnJz.png",
                                    "question": "Aprēķini figūras laukumu!\nNosaki dotās kvadrātfunkcijas grafika krustpunktu ar x asi!\nAtbildi šādi: (...;...)",
                                    "type": "text",
                                    "answers": ["0;2", "(0;2)"],
                                    "reward": 1,
                                    "hint": {
                                        "enabled": false,
                                        "question": "Test hint",
                                        "cost": 1,
                                    }
                                },
                                {
                                    "id": "math10",
                                    "image": "none",
                                    "question": "Kvadrātfunkcijas nulles ir x1=−6 un x2=10, parabolas vienādojums nav zināms.\n1. Aprēķini parabolas virsotnes abscisu (x0)!",
                                    "type": "text",
                                    "answers": [2, "2", "divi", "two"],
                                    "reward": 1,
                                    "hint": {
                                        "enabled": true,
                                        "question": "x0=(x1+x2)/2",
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
                                        "question": "Ortog......",
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
                    };
                    const stmt = db.prepare('INSERT INTO lessons (id, title, type, questions) VALUES (?, ?, ?, ?)');
                    for (const [id, lesson] of Object.entries(defaultLessons)) {
                        stmt.run(id, lesson.title, lesson.type, JSON.stringify(lesson.questions));
                    }
                    stmt.finalize();
                }
            });
        });
        console.log('[DATABASE] Database prepared!');
        return new Promise(function(resolve) {
            setTimeout(resolve, 500);
        });
    });
}

function startTimers() {
    setInterval(() => {
        updateAllUserLessons();
    }, 500);
}

module.exports = {
    prepareDatabase,
    startTimers
};
