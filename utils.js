const apiURL = "https://sugoku.herokuapp.com";

const getBoardData = async (difficulty = "hard", solve = true) => {
  try {
    const response = await fetch(`${apiURL}/board?difficulty=${difficulty}`);
    let data = await response.json();

    if (solve) {
      const solvedData = await getSolvedBoardData(data);
      data = { ...data, ...solvedData };
    }

    // console.log(data);
    return data;
  } catch (e) {
    console.log(e);
  }
};

const getSolvedBoardData = async (boardData) => {
  try {
    const response = await fetch(`${apiURL}/solve`, {
      method: "POST",
      body: encodeParams(boardData),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.log(e);
  }
};

/* Helper functions provided by API provider */

const encodeBoard = (board) =>
  board.reduce(
    (result, row, i) =>
      result +
      `%5B${encodeURIComponent(row)}%5D${i === board.length - 1 ? "" : "%2C"}`,
    ""
  );

const encodeParams = (params) =>
  Object.keys(params)
    .map((key) => key + "=" + `%5B${encodeBoard(params[key])}%5D`)
    .join("&");

getBoardData();

/* End of helper functions provided by API provider */
