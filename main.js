const body = document.querySelector("body");

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
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      const cell = document.querySelector(`.row${i}.col${j}`);
      const val = data[i][j];

      if (val) {
        cell.innerHTML = val;
      } else {
        cell.classList.add("to-fill");
      }
    }
  }
};

const getDataAndFillBoard = async (difficulty = "hard", solve = true) => {
  const { board } = await getBoardData(difficulty, solve);

  fillBoardData(board);
};

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

const handleClick = (e) => {
  if (e.target.classList.contains("to-fill")) {
    handleSelectCell(e);
  } else {
    deselectCell();
  }
};

const handleKeyPress = (e) => {
  const keyPressed = e.keyCode;
  console.log(keyPressed);

  if (keyPressed >= 49 && keyPressed <= 57) {
    const numPressed = Number(String.fromCharCode(keyPressed));

    const selectedCell = document.querySelector(".cell-selected");
    if (selectedCell) {
      selectedCell.innerHTML = numPressed;
    }
  } else if (keyPressed === 8) {
    const selectedCell = document.querySelector(".cell-selected");
    if (selectedCell) {
      selectedCell.innerHTML = "";
    }
  }
};

body.addEventListener("click", handleClick);
body.addEventListener("keydown", handleKeyPress);

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

/* INITIALIZE GAME */
generateEmptyBoard();
// getDataAndFillBoard();
fillBoardData(sampleData.board);
