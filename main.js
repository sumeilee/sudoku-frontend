const root = document.documentElement;
const body = document.querySelector("body");
const messageBar = document.querySelector(".message-bar");
const darkModeCheckBox = document.querySelector("#dark-mode");

let numNotes = 3;
let numMoves = 0;
let maxMoves;
let solution;
let playerBoard;
let guidedMode = true;
let notesMode = true;
let cellsToCycle = [];
let cellCycleIdx = 0;

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

const handleSelectCell = (cell, deselectIfSameCell = true) => {
  const prevCell = deselectCell();

  if (
    !prevCell ||
    !deselectIfSameCell ||
    (deselectIfSameCell && prevCell.id !== cell.id)
  ) {
    cell.classList.add("cell-selected");
  }
};

const editCell = (cell, value) => {
  if (cell.classList.contains("cell__num")) {
    // update moves and scoreboard only if number cell
    const i = cell.parentElement.dataset.row;
    const j = cell.parentElement.dataset.col;

    const currentCellValue = playerBoard[i][j];

    if (!currentCellValue && value) {
      numMoves++;
    } else if (currentCellValue && !value) {
      numMoves--;
    }

    playerBoard[i][j] = Number(value);
    // console.log(playerBoard);

    console.log(
      `input: ${value}, numMoves: ${numMoves}, maxMoves: ${maxMoves}`
    );
    if (numMoves === maxMoves) {
      console.log("results: " + checkResults());
    }

    if (guidedMode) {
      cell.classList.remove("incorrect");
      cell.classList.remove("correct");

      if (Number(value)) {
        if (solution[i][j] === Number(value)) {
          cell.classList.add("correct");
        } else {
          cell.classList.add("incorrect");
        }
      }
    }
  }

  // edit cell regardless of number cell or notes cell
  cell.innerHTML = value;
};

const handleClick = (e) => {
  if (e.target.closest(".to-fill")) {
    handleSelectCell(e.target);
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

  if ((keyPressed >= 49 && keyPressed <= 57) || keyPressed === 8) {
    // if number key or delete pressed
    const selectedCell = document.querySelector(".cell-selected");
    let editValue;

    if (selectedCell) {
      if (keyPressed >= 49 && keyPressed <= 57) {
        editValue = Number(String.fromCharCode(keyPressed));
      } else if (keyPressed === 8) {
        editValue = "";
      }

      editCell(selectedCell, editValue);
    }
  } else if (keyPressed >= 37 && keyPressed <= 40) {
    // if arrow key pressed
    handleArrowKeyPress(keyPressed);
  } else if (keyPressed === 13 && notesMode) {
    // if return key pressed and notes mode is on
    handleReturnKeyPress();
  }
};

const handleReturnKeyPress = () => {
  const selectedCell = document.querySelector(".cell-selected");

  if (selectedCell) {
    deselectCell();

    if (cellsToCycle.length !== 0) {
      // if there are currently notes to cycle through, exit cycle mode
      cellsToCycle = [];

      if (!selectedCell.classList.contains("cell__num")) {
        handleSelectCell(
          selectedCell.parentElement.parentElement.querySelector(".cell__num")
        );
      }
    } else {
      // if not currently cycling through notes, enter cycle mode
      cellsToCycle = [
        ...selectedCell.parentElement.querySelectorAll(".cell__note"),
        selectedCell,
      ];

      handleSelectCell(cellsToCycle[cellCycleIdx]);
    }
  }
};

const handleArrowKeyPress = (keyCode) => {
  if (cellsToCycle.length) {
    // if currently cycling through notes
    const numCells = cellsToCycle.length;
    let newCell;

    if (keyCode === 37 || keyCode === 39) {
      if (keyCode === 37) {
        cellCycleIdx--;
      } else if (keyCode === 39) {
        cellCycleIdx++;
      }

      let newIdx;
      if (cellCycleIdx >= 0) {
        newIdx = Math.abs(cellCycleIdx % numCells);
      } else {
        newIdx = numCells - Math.abs(cellCycleIdx % numCells);
        if (newIdx === numCells) {
          newIdx = 0;
        }
      }
      // console.log(`cycleIdx: ${cellCycleIdx}, newIdx: ${newIdx}`);

      newCell = cellsToCycle[newIdx];

      handleSelectCell(newCell, false);
    }
  } else {
    // traverse all number cells
    const selectedCell = document.querySelector(".cell-selected");

    if (selectedCell) {
      let i = Number(selectedCell.parentElement.dataset.row);
      let j = Number(selectedCell.parentElement.dataset.col);

      if (keyCode === 37) {
        // left arrow
        j = Math.max(0, j - 1);
      } else if (keyCode === 39) {
        // right arrow
        j = Math.min(playerBoard.length - 1, j + 1);
      } else if (keyCode === 38) {
        // up arrow
        i = Math.max(0, i - 1);
      } else if (keyCode === 40) {
        // down arrow
        i = Math.min(playerBoard.length - 1, i + 1);
      }

      const newCell = document.querySelector(
        `[data-row="${i}"][data-col="${j}"] .cell__num`
      );

      handleSelectCell(newCell, false);
    }
  }
};

body.addEventListener("click", handleClick);
body.addEventListener("keydown", handleKeyPress);

darkModeCheckBox.addEventListener("change", () => {
  if (darkModeCheckBox.checked) {
    const darkest = "#1b262c"; // dark grey
    const midDark = "#4f3b78";
    const midLight = "#927fbf";
    const lightest = "#c4bbf0";

    root.style.setProperty("--background-color", darkest);
    root.style.setProperty("--notes-background-color", midDark);
    root.style.setProperty("--font-color", lightest);
    root.style.setProperty("--board-border-color", midLight);
    root.style.setProperty("--number-pad-bg-color", midDark);
    root.style.setProperty("--correct-color", "#77abb7");
    root.style.setProperty("--incorrect-color", "#f1bbd5");
    root.style.setProperty(
      "--bg-color-selected-cell",
      "rgb(220, 220, 220, 0.3)"
    );
  } else {
    root.style.setProperty("--background-color", "white");
    root.style.setProperty("--notes-background-color", "#efefef");
    root.style.setProperty("--font-color", "black");
    root.style.setProperty("--board-border-color", "grey");
    root.style.setProperty("--number-pad-bg-color", "#efefef");
    root.style.setProperty("--correct-color", "green");
    root.style.setProperty("--incorrect-color", "red");
    root.style.setProperty("--bg-color-selected-cell", "lightgrey");
  }
});

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
