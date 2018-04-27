$(document).ready(function() {
  attachListeners()
  setTurn()
  if(checkWinner() || turn >= 8){
    $("td").off("click")
  }
})

var turn
var board = function () {
  clearGame()
  return createBoardArray()
}
var id = id || 0

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
  var wins = [
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
    var approvedMove = updateState(square)
    var result = checkWinner()
    if (turn >= 8){
      setMessage("Tie game.")
    }
    if(result || turn >= 8){
      // set a timer
      saveGame()
      clearGame()
      board = createBoardArray()
      turn = 0
      id = 0
      $("#message").text("")
    } else {
      if(approvedMove) {
        turn ++
      }
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
    var state = $.param({"state": board})
    $.post("/games", state).done(function(game){
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
    var i = $("#games > button").length
    for(i; i < data["data"].length; i++) {
      var id = data["data"][i]["id"]
      $("#games").append('<button class="js-game" id="'+ id +'">' + id + '</button>')
    }
    $(".js-game").on("click", loadGame)
  })
}

function clearGame() {
  var squares = $("td")
  for(var i = 0; i < squares.length; i++ ){
    squares[i].innerHTML = ""
    }
  id = 0
  turn = 0
}

function loadGame(){
   id = $(this).attr("id")
  $.get("/games/"+ id).done(function(data){
    board = data["data"]["attributes"]["state"]
    createBoard()
    setTurn()
    if(checkWinner() || turn >= 8){
      $("td").off("click")
    }
  })
}


function createBoardArray() {
  var count = 0
  var board = []
  for(var y = 0; y < 3; y++ ){
    for(var x = 0; x < 3; x++){
      board[count] = $(`[data-x="${x}"][data-y="${y}"]`).text()
      count ++
    }
  }
  return board
}

function createBoard() {
  var squares = $("td")
  for(var i = 0; i < squares.length; i++ ){
    squares[i].innerHTML = board[i]
    }
}

function setTurn() {
  var squares = $("td")
  var count = 0
  for(var i = 0; i < 9; i++) {
    if(squares[i].innerHTML != "") {
      count++
    }
  }
  turn = count
}
