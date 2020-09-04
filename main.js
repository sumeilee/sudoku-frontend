const generateEmptyBoard = (size = 9) => {
  const board = document.querySelector(".board");

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const cell = document.createElement("div");
      cell.setAttribute("class", `board__cell row${i} col${j}`);

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
      }
    }
  }
};

const getDataAndFillBoard = async (difficulty = "hard", solve = true) => {
  const { board } = await getBoardData(difficulty, solve);

  fillBoardData(board);
};

generateEmptyBoard();
getDataAndFillBoard();
