$(document).ready(attachListeners)

let turn = 0
let board = ['', '', '', '', '', '', '', '', '']
let id = 0

function player() {
  return ((turn % 2 === 0) ? "X":"O")
}

function updateState(square) {
  if($(square).text() == ""){
    $(square).text(player())
    return true
  } else {
    return false
  }
}

function setMessage(message) {
  $("#message").text(message)
}

function checkWinner() {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]
  board = createBoardArray()
  result =  wins.some(function (combo) {
    if(board[combo[0]] === board[combo[1]] && board[combo[1]] === board[combo[2]] && board[combo[0]] != ""){
      setMessage(`Player ${board[combo[0]]} Won!`)
      return true;
    }
  })
  return result
}

function doTurn(square) {
  let approvedMove = updateState(square)
  if(checkWinner()) {
    // I think the setTimeout is nice so that you can see your win.  However, it makes a 3 test fail.
    // setTimeout(newGame, 1000)
    newGame()
  } else if(turn === 8){
      setMessage("Tie game.")
      // setTimeout(newGame, 1000)
      newGame()
  } else if(approvedMove) {
    turn ++
  }
}

function attachListeners() {
  $("td").on("click", function(event) {
    // this is only necessary due to how the tests are written.  I think it looks ugly.
    doTurn(event.target)
  })
  $("#save").on("click", saveGame)
  $("#previous").on("click", previousGame)
  $("#clear").on("click", clearGame)
}

function saveGame(){
  if(id === 0) {
    $.post("/games", {state: board}).done(function(game){
      id = game["data"]["id"]
    })
    // $.ajax({
    //   type: "POST",
    //   url: "/games",
    //   data: {state: JSON.stringify(board)},
    //   dataType: "json",
    //   success: function(game){
    //     id = game["data"]["id"]
    //   }
    // })
  } else {
    $.post("/games/" + id, {_method: "PATCH", state: board})
    //To pass tests, I have to use the code below.  I do not think it looks as nice though.
    // $.ajax({
    //   type: "PATCH",
    //   url: "/games/" + id,
    //   data: {state: JSON.stringify(board)},
    //   dataType: "json"
    // })
  }
}

function previousGame(){
  $.get('/games').done(function(data) {
    let i = $("#games > button").length
    for(i; i < data["data"].length; i++) {
      id = data["data"][i]["id"]
      $("#games").append('<button class="js-game" id="'+ id +'">' + id + '</button>')
    }
    $(".js-game").on("click", loadGame)
  })
}

function clearGame() {
  let squares = $("td")
  for(let i = 0; i < squares.length; i++ ){
    squares[i].innerHTML = ""
    }
  createBoardArray()
  id = 0
  turn = 0
  $("#message").text("")
}

function loadGame(){
  clearGame()
   id = $(this).attr("id")
  $.get("/games/"+ id).done(function(data){
    board = data["data"]["attributes"]["state"]
    createBoard()
    setTurn()
    if(checkWinner() || turn >= 8){
      $("td").off("click")
    } else {
      $("td").on("click", function(event) {
        // this is only necessary due to how the tests are written.  I think it looks ugly.
        doTurn(event.target)
      })
    }
  })
}


function createBoardArray() {
  let count = 0
  // let board = []
  for(let y = 0; y < 3; y++ ){
    for(let x = 0; x < 3; x++){
      board[count] = $(`[data-x="${x}"][data-y="${y}"]`).text()
      count ++
    }
  }
  return board
}

function createBoard() {
  let squares = $("td")
  for(let i = 0; i < squares.length; i++ ){
    squares[i].innerHTML = board[i]
    }
}

function setTurn() {
  let squares = $("td")
  let count = 0
  for(let i = 0; i < 9; i++) {
    if(squares[i].innerHTML != "") {
      count++
    }
  }
  turn = count
}

function newGame () {
  saveGame()
  clearGame()
  $("td").on("click", function(event) {
    // this is only necessary due to how the tests are written.  I think it looks ugly.
    doTurn(event.target)
  })
}
