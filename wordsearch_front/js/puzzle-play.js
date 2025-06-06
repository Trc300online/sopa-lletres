import { modify, select } from "./functions.js";

let puzzleId = new URLSearchParams(location.search).get('puzzle');
const boardElem = document.querySelector("#gameBoard");
let lettersElem;
const wordsElem = document.querySelector("#gameWords");
const timer = document.querySelector("#timer");
const wordsDiscovered = [];
const words = [];
let selected = [];
let startTarget;
let difficulty;
let timeStart;

boardElem.addEventListener('mousedown', handleMousedown);
boardElem.addEventListener('mouseup', handleMouseup);

let uid = localStorage.getItem('uid');
if (uid !== null) {
    select(`
        select Color.hex
        from Color, Player
        where Player.id = ${uid}
        and Player.tableColorId = Color.id
        union ALL
		select Color.hex
        from Color, Player
        where Player.id = ${uid}
        and Player.buttonColorId = Color.id;
        `).then(data => {
        document.documentElement.style.setProperty(`--bg-color`, data[0].hex);
        document.documentElement.style.setProperty(`--bt-dark`, data[1].hex);
    });
}

select(`select letter
        from Letter
        where Letter.puzzleId = ${puzzleId};`)
    .then(data => {
        let letterHtml = '';
        let count = 0;
        for (let row of data) {
            letterHtml += `<div value='${count++}'>${row.letter.toUpperCase()}</div>`;
        }

        boardElem.innerHTML = letterHtml;
        lettersElem = document.querySelectorAll("#gameBoard>div");
    });

select(`select Word.id, word, start, end
        from Puzzle_Word, Word
        where Puzzle_Word.puzzleId = ${puzzleId}
        and Puzzle_Word.wordId = Word.id;`)
    .then(data => {
        let wordHtml = '';
        for (let row of data) {
            words.push(row);
            wordHtml += `<div value="w${row.id}">${row.word.toUpperCase()}</div>`;
        }

        wordsElem.innerHTML = wordHtml;
    });

select(`select name, difficulty, weight
        from Puzzle, Difficulty
        where Puzzle.id = ${puzzleId}
        and difficultyId = Difficulty.id;`)
    .then(data => {
        document.querySelector('#puzzleName').textContent = data[0].name;
        document.querySelector('#puzzleDifficulty').textContent = 'DIFICULTAT ' + data[0].difficulty.toUpperCase();
        difficulty = data[0].weight;
        timeStart = Date.now();
    });

function handleMousedown(e) {
    startTarget = e.target.getAttribute('value');
    for (let word of words) {
        if (startTarget == word.start || startTarget == word.end) {
            selected.push(word);
        }
    }
}

function handleMouseup(e) {
    let target = e.target.getAttribute('value');
    if (target === startTarget) { return; }
    for (let word of selected) {
        if ((target == word.start || target == word.end) && !wordDiscovered(word)) {
            document.querySelector(`#gameWords div[value='w${word.id}']`).classList.add('text-green');
            wordsDiscovered.push(word);
        }
    }

    if (won()) {
        handleVictory();
    }

    selected = [];
    drawDiscoveredWords();
}

function drawDiscoveredWords() {
    for (let word of wordsDiscovered) {
        let start = word.start;
        let end = word.end;
        let yDifference = (Math.floor(end / 10)) - (Math.floor(start / 10));
        let xDifference = (Math.floor(end % 10)) - (Math.floor(start % 10));
        let yOffset = Math.min(Math.max(yDifference, -1), 1);
        let xOffset = Math.min(Math.max(xDifference, -1), 1);

        let coord = start;
        for (let i = 0; i < word.word.length; i++) {
            lettersElem[coord].classList.add('text-green');
            coord += xOffset + yOffset * 10;
        }
    }
}

function wordDiscovered(inWord) {
    for (let word of wordsDiscovered) {
        if (word === inWord) {
            return true;
        }
    }
    return false;
}

function won() {
    if (wordsDiscovered.length === 10) {
        return true;
    }
    return false;
}

function handleVictory() {
    boardElem.removeEventListener('mousedown', handleMousedown);
    boardElem.removeEventListener('mouseup', handleMouseup);

    const seconds = Math.round((Date.now() - timeStart) / 1000);
    const score = Math.max(0, Math.round((60 - seconds) * difficulty));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    alert(`Has acabat en ${minutes} minuts i ${seconds} segons amb una puntuació de ${score} punts`);

    const uid = localStorage.getItem('uid');
    if (uid === null) { return; }

    let query = `
        insert into Puzzle_Player (puzzleId, playerId, score)
        values (${puzzleId}, ${uid}, ${score})
        on duplicate key
        update score=${score};
    `;

    modify(query);
}

setInterval(_ => {
    if (wordsDiscovered.length >= 10) return;
    let now = new Date().getTime();
    let elapsed = now - timeStart;

    let minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

    timer.textContent = minutes + ":" + seconds.toString().padStart(2, '0');
}, 1000);