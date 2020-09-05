const body = document.querySelector("body");
let numMoves = 0;
let maxMoves;
let solution;
let finalBoard;

const generateEmptyBoard = (size = 9) => {
  const board = document.querySelector(".board");
  let count = 0;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const cell = document.createElement("div");
      cell.setAttribute("class", `board__cell row${i} col${j}`);
      cell.setAttribute("id", `cell${count}`);
      count++;

      board.appendChild(cell);
    }
  }
};

const fillBoardData = (data) => {
  maxMoves = 0;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      const cell = document.querySelector(`.row${i}.col${j}`);
      const val = data[i][j];

      if (val) {
        cell.innerHTML = val;
      } else {
        cell.classList.add("to-fill");
        maxMoves++;
      }
    }
  }
};

const convertBoardToArray = (size = 9) => {
  const board = [];

  for (let i = 0; i < size; i++) {
    board[i] = [];
    for (let j = 0; j < size; j++) {
      const cell = document.querySelector(`.row${i}.col${j}`);
      board[i][j] = Number(cell.innerText);
    }
  }

  return board;
};

const checkResults = (withAPI = true) => {
  finalBoard = convertBoardToArray(9);

  if (withAPI) {
    return JSON.stringify(finalBoard) === JSON.stringify(solution);
  }

  return false;
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
  const prevSelectedCell = deselectCell();

  if (!prevSelectedCell || prevSelectedCell.id !== e.target.id) {
    e.target.classList.add("cell-selected");
  }
};

const editCell = (cell, value) => {
  cell.innerHTML = value;
  if (value) {
    numMoves++;
  } else {
    numMoves--;
  }

  console.log(`maxMoves: ${maxMoves}, numMoves: ${numMoves}`);
  if (numMoves === maxMoves) {
    console.log("results: " + checkResults());
  }
};

const handleClick = (e) => {
  if (e.target.classList.contains("to-fill")) {
    handleSelectCell(e);
  } else {
    deselectCell();
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
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 4, 0, 0, 0, 0, 8, 0],
    [0, 0, 8, 0, 5, 0, 0, 0, 0],
    [3, 1, 0, 0, 0, 6, 0, 0, 0],
    [4, 6, 0, 8, 9, 1, 0, 3, 5],
    [8, 0, 0, 0, 7, 0, 0, 1, 6],
    [5, 0, 1, 0, 8, 0, 9, 0, 4],
    [0, 4, 0, 9, 1, 5, 8, 6, 2],
    [0, 8, 6, 7, 0, 0, 0, 5, 1],
  ],
  difficulty: "easy",
  solution: [
    [2, 3, 9, 1, 6, 8, 5, 4, 7],
    [1, 5, 4, 2, 3, 7, 6, 8, 9],
    [6, 7, 8, 4, 5, 9, 1, 2, 3],
    [3, 1, 2, 5, 4, 6, 7, 9, 8],
    [4, 6, 7, 8, 9, 1, 2, 3, 5],
    [8, 9, 5, 3, 7, 2, 4, 1, 6],
    [5, 2, 1, 6, 8, 3, 9, 7, 4],
    [7, 4, 3, 9, 1, 5, 8, 6, 2],
    [9, 8, 6, 7, 2, 4, 3, 5, 1],
  ],
  status: "solved",
};

solution = sampleData.solution;

generateEmptyBoard();
// getDataAndFillBoard();
fillBoardData(sampleData.board);
