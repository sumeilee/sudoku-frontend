const root = document.documentElement;
const body = document.querySelector("body");
const messageBar = document.querySelector(".message-bar");
const darkModeCheckBox = document.querySelector("#dark-mode");
const guidedModeCheckBox = document.querySelector("#guided-mode");
const loadingModal = document.querySelector(".modal");

let numNotes = 3;
let numMoves = 0;
let maxMoves;
// let solution;
let playerBoard;
let guidedMode = false;
let darkMode = false;
let notesMode = true;
let cellsToCycle = [];
let cellCycleIdx;
let apiData;
let storage;
let testing = false;
let localStorageKey = "sudokuGameData";
let difficulty = "hard";
let solve = true;
let useLocalStorage = true;
let boardSize = 9;

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

const deepCopy2DArr = (arr) => {
  return arr.map((subArr) => subArr.map((elt) => elt));
};

// fills board with api data
const fillBoardData = (data) => {
  maxMoves = 0;
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
      const val = data[i][j];

      if (val) {
        cell.classList.remove("to-fill");
        cell.children[0].innerHTML = val;
        // cell.innerHTML = val;
      } else {
        cell.classList.add("to-fill");
        cell.children[0].innerHTML = "";
        maxMoves++;
      }
    }
  }
};

const fillSavedUserInput = () => {
  storage = getLocalStorage(localStorageKey);

  const notes = storage.notes;
  for (let key in notes) {
    document.getElementById(key).innerHTML = notes[key];
  }

  const userFilled = storage.userFilled;
  userFilled.forEach((subArray, i) =>
    subArray.forEach((val, j) => {
      if (val) {
        const cell = document.querySelector(
          `[data-row="${i}"][data-col="${j}"] .cell__num`
        );
        cell.innerHTML = val;

        if (Number(val) === apiData.solution[i][j]) {
          cell.classList.add("correct");
        } else {
          cell.classList.add("incorrect");
        }
      }
    })
  );
};

const checkResults = (withAPI = true) => {
  let isCorrect = false;

  if (withAPI) {
    isCorrect =
      JSON.stringify(playerBoard) === JSON.stringify(apiData.solution);
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

const clearNotes = () => {
  document.querySelectorAll(".cell__note").forEach((note) => {
    note.innerHTML = "";
  });
};

const getNewGame = async (difficulty = "hard", solve = true) => {
  // generateEmptyBoard();
  displayLoading(true);

  apiData = await getBoardData(difficulty, solve);
  updateLocalStorage(localStorageKey, { apiData });

  displayLoading(false);
  resetBoard();
  // playerBoard = deepCopy2DArr(apiData.board);
  // numMoves = 0;

  // if (useLocalStorage) {
  //   updateLocalStorage(localStorageKey, {
  //     notes: {},
  //     numMoves,
  //     playerBoard,
  //     userFilled: [...Array(boardSize)].map((x) => Array(boardSize).fill(0)),
  //   });
  // }
};

const resetBoard = () => {
  // re-populate board with api data
  fillBoardData(apiData.board);

  // clear notes
  clearNotes();

  playerBoard = deepCopy2DArr(apiData.board);
  numMoves = 0;

  if (useLocalStorage) {
    updateLocalStorage(localStorageKey, {
      notes: {},
      numMoves,
      playerBoard,
      userFilled: [...Array(boardSize)].map((x) => Array(boardSize).fill(0)),
    });
  }
};

const displayLoading = (toDisplay = false) => {
  if (toDisplay) {
    loadingModal.style.display = "flex";
  } else {
    loadingModal.style.display = "none";
  }
};

const getDataAndFillBoard = async (difficulty = "hard", solve = true) => {
  // show loading
  displayLoading(true);

  apiData = await getBoardData(difficulty, solve);
  playerBoard = deepCopy2DArr(apiData.board);

  if (useLocalStorage) {
    updateLocalStorage(localStorageKey, { playerBoard, apiData });
  }

  displayLoading(false);
  fillBoardData(apiData.board);
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

  if (cell.classList.contains("cell__note") && !cellsToCycle.length) {
    cellsToCycle = [
      ...cell.parentElement.querySelectorAll(".cell__note"),
      cell.parentElement.parentElement.querySelector(".cell__num"),
    ];

    cellCycleIdx = cellsToCycle.indexOf(cell);
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

    if (useLocalStorage) {
      const userFilled = storage.userFilled;
      userFilled[i][j] = Number(value);

      updateLocalStorage(localStorageKey, {
        userFilled,
        playerBoard,
        numMoves,
      });
    }

    console.log(
      `input: ${value}, numMoves: ${numMoves}, maxMoves: ${maxMoves}`
    );
    if (numMoves === maxMoves) {
      console.log("results: " + checkResults());
    }

    // for guided mode
    // if (guidedMode) {
    cell.classList.remove("incorrect");
    cell.classList.remove("correct");

    if (Number(value)) {
      if (apiData.solution[i][j] === Number(value)) {
        cell.classList.add("correct");
      } else {
        cell.classList.add("incorrect");
      }
    }
    // }
    setGuidedFontColors(darkMode, guidedMode);
  } else if (cell.classList.contains("cell__note")) {
    if (useLocalStorage) {
      const notes = storage.notes;
      notes[cell.id] = value;

      // storage.playerBoard = playerBoard;
      // storage.userFilled[cell.id] = value;

      updateLocalStorage(localStorageKey, {
        notes,
      });
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
  } else if (e.target.classList.contains("clear-pad__btn")) {
    const selectedCell = document.querySelector(".cell-selected");
    if (selectedCell) {
      editCell(selectedCell, "");
    }
  } else if (e.target.id === "new-game") {
    const diffSelect = document.querySelector("#game-difficulty");
    difficulty = diffSelect.options[diffSelect.selectedIndex].value;
    console.log(`difficulty: ${difficulty}`);
    getNewGame(difficulty, solve);
  } else if (e.target.id === "reset-game") {
    resetBoard();
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

      cellCycleIdx = 0;
      handleSelectCell(cellsToCycle[cellCycleIdx]);
    }
  }
};

const handleArrowKeyPress = (keyCode) => {
  if (cellsToCycle.length) {
    // console.log("cycling");
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

const updateLocalStorage = (key, updateObj) => {
  storage = { ...storage, ...updateObj };

  localStorage.setItem(localStorageKey, JSON.stringify(storage));

  console.log("updating local storage to: ");
  console.log(getLocalStorage(localStorageKey));
};

const getLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key));
};

const removeLocalStorage = (key) => {
  localStorage.remove(key);
};

body.addEventListener("click", handleClick);
body.addEventListener("keydown", handleKeyPress);

const setThemeColors = (darkMode = false, guidedMode = false) => {
  if (darkMode) {
    const darkest = "#1b262c"; // dark grey
    // const midDark = "#4f3b78";
    const midDark = "#3a2663";
    const midLight = "#927fbf";
    const lightest = "#c4bbf0";

    root.style.setProperty("--background-color", darkest);
    root.style.setProperty("--font-color", "#c4bbf0");
    root.style.setProperty("--notes-background-color", midDark);
    root.style.setProperty("--board-border-color", midLight);
    root.style.setProperty("--number-pad-bg-color", midDark);
    root.style.setProperty("--number-pad-font-color", lightest);
    root.style.setProperty("--control-btn-bg-color", darkest);
    root.style.setProperty("--control-btn-font-color", lightest);
    root.style.setProperty("--bg-color-selected", "rgb(220, 220, 220, 0.3)");
    root.style.setProperty("--bg-color-modal", darkest);
  } else {
    root.style.setProperty("--background-color", "white");
    root.style.setProperty("--font-color", "black");
    root.style.setProperty("--notes-background-color", "#efefef");
    root.style.setProperty("--board-border-color", "grey");
    root.style.setProperty("--number-pad-bg-color", "grey");
    root.style.setProperty("--number-pad-font-color", "white");
    root.style.setProperty("--control-btn-bg-color", "white");
    root.style.setProperty("--control-btn-font-color", "black");
    root.style.setProperty("--bg-color-selected", "lightgrey");
    root.style.setProperty("--bg-color-modal", "white");
  }

  setGuidedFontColors(darkMode, guidedMode);
};

darkModeCheckBox.addEventListener("change", () => {
  if (darkModeCheckBox.checked) {
    darkMode = true;
  } else {
    darkMode = false;
  }
  setThemeColors(darkMode, guidedMode);

  if (useLocalStorage) {
    updateLocalStorage(localStorageKey, { darkMode });
  }
});

guidedModeCheckBox.addEventListener("change", () => {
  if (guidedModeCheckBox.checked) {
    guidedMode = true;
  } else {
    guidedMode = false;
  }
  setGuidedFontColors(darkMode, guidedMode);

  if (useLocalStorage) {
    updateLocalStorage(localStorageKey, { guidedMode });
  }
});

const setGuidedFontColors = (darkMode, guidedMode) => {
  if (darkMode) {
    if (guidedMode) {
      root.style.setProperty("--correct-color", "#77abb7");
      root.style.setProperty("--incorrect-color", "#f1bbd5");
    } else {
      root.style.setProperty("--correct-color", "#c4bbf0");
      root.style.setProperty("--incorrect-color", "#c4bbf0");
    }
  } else {
    if (guidedMode) {
      root.style.setProperty("--correct-color", "green");
      root.style.setProperty("--incorrect-color", "red");
    } else {
      root.style.setProperty("--correct-color", "black");
      root.style.setProperty("--incorrect-color", "black");
    }
  }
};

const getTestDataAndFillBoard = () => {
  apiData = {
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

  playerBoard = deepCopy2DArr(apiData.board);

  if (useLocalStorage) {
    updateLocalStorage(localStorageKey, {
      playerBoard,
      apiData,
    });
  }

  fillBoardData(apiData.board);
};

/* INITIALIZE GAME */

console.log("initializing game");
generateEmptyBoard();

if (useLocalStorage && getLocalStorage(localStorageKey)) {
  console.log("game data in local storage");
  storage = getLocalStorage(localStorageKey);
  ({ apiData, playerBoard, numMoves, darkMode, guidedMode } = storage);

  fillBoardData(apiData.board);
  fillSavedUserInput();

  darkModeCheckBox.checked = darkMode;
  guidedModeCheckBox.checked = guidedMode;

  document.querySelectorAll("#game-difficulty option").forEach((option) => {
    if (option.classList.contains(difficulty)) {
      option.selected = true;
    } else {
      option.selected = false;
    }
  });

  setThemeColors(darkMode, guidedMode);
} else {
  console.log("no game data in local storage");
  storage = {
    apiData: {},
    darkMode,
    guidedMode,
    notes: {},
    numMoves: 0,
    playerBoard: [...Array(boardSize)].map((x) => Array(boardSize).fill(0)),
    userFilled: [...Array(boardSize)].map((x) => Array(boardSize).fill(0)),
  };

  if (testing) {
    getTestDataAndFillBoard();
  } else {
    getDataAndFillBoard();
  }
}
