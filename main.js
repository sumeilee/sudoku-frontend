const body = document.querySelector("body");
const messageBar = document.querySelector(".message-bar");

let numNotes = 3;
let numMoves = 0;
let maxMoves;
let solution;
let playerBoard;
let guidedMode = true;
let notesMode = false;

const generateNumberPad = (size = 9) => {
  const numberPad = document.querySelector(".number-pad");
  for (let i = 1; i <= size; i++) {
    const numButton = document.createElement("button");
    numButton.setAttribute("class", "number-pad__btn");
    numButton.innerHTML = i;
    numberPad.appendChild(numButton);
  }
};

const generateEmptyBoard = (size = 9) => {
  const board = document.querySelector(".board");
  let cellCount = 0;
  let noteCount = 0;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const cell = document.createElement("div");
      cell.setAttribute("class", `board__cell`);
      cell.setAttribute("data-row", i);
      cell.setAttribute("data-col", j);

      const num = document.createElement("div");
      num.setAttribute("class", "cell__num");
      num.setAttribute("id", cellCount);
      cell.appendChild(num);
      cellCount++;

      const notes = document.createElement("div");
      notes.setAttribute("class", "cell__notes");
      cell.appendChild(notes);

      for (let i = 0; i < numNotes; i++) {
        const note = document.createElement("div");
        note.setAttribute("class", "cell__note");
        note.setAttribute("id", size ** 2 + noteCount);
        notes.appendChild(note);
        noteCount++;
      }

      board.appendChild(cell);
    }
  }

  generateNumberPad(size);

  // if (!notesMode) {
  //   document.querySelectorAll(".cell__notes").forEach((div) => {
  //     div.style.display = "none";
  //   });
  // }
};

const fillBoardData = (data) => {
  maxMoves = 0;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
      const val = data[i][j];

      if (val) {
        cell.children[0].innerHTML = val;
        // cell.innerHTML = val;
      } else {
        cell.classList.add("to-fill");
        maxMoves++;
      }
    }
  }
  playerBoard = data;
};

const checkResults = (withAPI = true) => {
  let isCorrect = false;

  if (withAPI) {
    isCorrect = JSON.stringify(playerBoard) === JSON.stringify(solution);
  }

  if (isCorrect) {
    displayMessage("Good job!");
  } else {
    displayMessage("Try again");
  }

  return isCorrect;
};

const displayMessage = (msg) => {
  messageBar.innerHTML = `<p>${msg}</p>`;
};

const getDataAndFillBoard = async (difficulty = "hard", solve = true) => {
  const { board } = await getBoardData(difficulty, solve);

  fillBoardData(board);
};

/* EVENT LISTENERS AND HANDLERS */
const deselectCell = () => {
  const selectedCell = document.querySelector(".cell-selected");

  if (selectedCell && selectedCell.classList) {
    selectedCell.classList.remove("cell-selected");
  }
  return selectedCell;
};

const handleSelectCell = (e) => {
  const prevCell = deselectCell();
  const currentCell = e.target;

  if (!prevCell || prevCell.id !== currentCell.id) {
    currentCell.classList.add("cell-selected");
  }
};

const editCell = (cell, value) => {
  if (cell.classList.contains("cell__num")) {
    const i = cell.parentElement.dataset.row;
    const j = cell.parentElement.dataset.col;

    const currentCellValue = playerBoard[i][j];

    if (!currentCellValue) {
      // if cell not currently filled, update move count
      if (value) {
        numMoves++;
      } else {
        numMoves--;
      }

      console.log(`maxMoves: ${maxMoves}, numMoves: ${numMoves}`);
      if (numMoves === maxMoves) {
        console.log("results: " + checkResults());
      }
    }

    if (guidedMode) {
      cell.classList.remove("incorrect");
      cell.classList.remove("correct");

      if (solution[i][j] === Number(value)) {
        cell.classList.add("correct");
      } else {
        cell.classList.add("incorrect");
      }
    }

    playerBoard[i][j] = Number(value);
    console.log(playerBoard);
  }

  cell.innerHTML = value;
};

const handleClick = (e) => {
  if (e.target.closest(".to-fill")) {
    handleSelectCell(e);
  } else if (e.target.classList.contains("number-pad__btn")) {
    handleNumPadPress(e);
  } else if (e.target.classList.contains("check-results")) {
    checkResults();
  } else {
    deselectCell();
  }
};

const handleNumPadPress = (e) => {
  const selectedCell = document.querySelector(".cell-selected");

  if (selectedCell) {
    const editValue = e.target.innerHTML;
    editCell(selectedCell, editValue);
  }
};

const handleKeyPress = (e) => {
  const keyPressed = e.keyCode;
  let editValue;

  const selectedCell = document.querySelector(".cell-selected");

  if (selectedCell) {
    if (keyPressed >= 49 && keyPressed <= 57) {
      editValue = Number(String.fromCharCode(keyPressed));
      editCell(selectedCell, editValue);
    } else if (keyPressed === 8) {
      editValue = "";
      editCell(selectedCell, editValue);
    }
  }
};

body.addEventListener("click", handleClick);
body.addEventListener("keydown", handleKeyPress);

/* INITIALIZE GAME */
const sampleData = {
  board: [
    [2, 6, 9, 0, 0, 0, 0, 0, 0],
    [0, 0, 4, 5, 7, 8, 2, 0, 0],
    [5, 7, 0, 2, 0, 0, 1, 0, 4],
    [3, 1, 0, 4, 5, 0, 0, 9, 0],
    [0, 5, 6, 8, 0, 7, 3, 1, 0],
    [8, 0, 0, 0, 2, 0, 4, 0, 0],
    [0, 2, 0, 0, 0, 5, 0, 0, 0],
    [0, 0, 3, 0, 8, 0, 6, 0, 5],
    [9, 0, 0, 0, 0, 0, 0, 4, 1],
  ],
  difficulty: "easy",
  solution: [
    [2, 6, 9, 3, 1, 4, 5, 7, 8],
    [1, 3, 4, 5, 7, 8, 2, 6, 9],
    [5, 7, 8, 2, 6, 9, 1, 3, 4],
    [3, 1, 2, 4, 5, 6, 8, 9, 7],
    [4, 5, 6, 8, 9, 7, 3, 1, 2],
    [8, 9, 7, 1, 2, 3, 4, 5, 6],
    [6, 2, 1, 7, 4, 5, 9, 8, 3],
    [7, 4, 3, 9, 8, 1, 6, 2, 5],
    [9, 8, 5, 6, 3, 2, 7, 4, 1],
  ],
  status: "solved",
};

solution = sampleData.solution;

generateEmptyBoard();
// getDataAndFillBoard();
fillBoardData(sampleData.board);
