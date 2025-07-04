//IFFE to create the Game Board
const GameBoard = (function (){
    const board = [];
    const rows = 3;
    const columns = 3;

    for(i=0;i<rows;i++){
        board[i] = [];
        for(j=0;j<columns;j++){
            board[i].push(null);
        }
    }

    function getBoard (){
        return board;
    }

    function addChoice (row, col, choice){
        if (board[row][col] === null){
            board[row][col] = choice;
        } 
        
    }

    function getWinLines (){
        const wRows = board.map(row => {
            return row;
        });
        const wCols = board[0].map( (_,colIndex) => {
            const col = board.map(cell => {
                return cell[colIndex];
            });
            return col;
        });
        const lDiagonal = [board[0][0], board[1][1], board[2][2]];
        const rDiagonal = [board[2][0], board[1][1], board[0][2]];

        function getWinningRows(){
            return wRows;
        }

        function getWinningCols(){
            return wCols;
        }

        function getWinningDiags(){
            return [lDiagonal, rDiagonal];
        }

        return {getWinningRows, getWinningCols, getWinningDiags};
    }

    return { getBoard, addChoice, getWinLines }

})();

//Factory function to create Players
function createPlayer(name, choice) {
    let score = 0;

    return {
        getName: () => name,
        setName: (newName) => name = newName,
        getChoice: () => choice,
        getScore: () => score,
        incrementScore: () => score++,
        resetScore: () => score = 0
    };
}

//IFFE to create the Players
const GamePlayers = (function (){

    const player = [
        createPlayer("", "O"),
        createPlayer("", "X"),
    ];

    let currentplayer = 0;

    function getPlayer(){
        return player;
    }

    function getCurrentPlayer(){
        return player[currentplayer];
    }

    function switchPlayer(){
        currentplayer = currentplayer === 0 ? 1 : 0;
        return currentplayer;
    }

    function getChoice(){
        return player[currentplayer].getChoice();
    }

    function setName(index, name){
        if(index >= 0 && index < player.length){
            player[index].setName(name);
        }
    }

    function setNewScore(){
        player.forEach(p => p.resetScore());
    }

    return {getPlayer, getCurrentPlayer, getChoice, switchPlayer, setName, setNewScore}
})();

//IFFE to control the flow of the game
const GameController = (function (){
    let gameOver = false;

    function playerMove(row, col){
        if(gameOver){
            return;
        } else{
            const choice = GamePlayers.getChoice();   
            GameBoard.addChoice(row, col, choice);
            console.log(GameBoard.getBoard());
            // Check for win BEFORE switching player
            checkWinner();

            // Switch player only if game is not over
            if (!gameOver) {
                GamePlayers.switchPlayer();
            }
        }

    }

    function checkWinner() {
        const board = GameBoard.getBoard();
        //Transform the 2D array to a 1D array, and check if its full
        const isBoardFull = board.flat().every(cell => cell !== null);
        const wLines = GameBoard.getWinLines(); 
        const wPlayer = GamePlayers.getPlayer();
        //Get the player based on the choice
        const oIndex = wPlayer.findIndex(player => player.getChoice() === "O");
        const xIndex = wPlayer.findIndex(player => player.getChoice() === "X");
        
        //Iterate through the resulting functions, object.values to iterate the values of the each key
        for(const getFn of Object.values(wLines)){
            //Saved the result of each function to get the array from each one
            const lines = getFn();
            //Iterate trhough the winning lines array to check if they match O or X
            for(let i = 0; i < lines.length; i++){
                
                const line = lines[i];
                if(line.every(cell => cell === "O")){ 
                    gameOver = true;
                    wPlayer[oIndex].incrementScore();
                    DOMController.updateUIScore();
                    DOMController.showUIWinner(wPlayer[oIndex].getName());
                    return;
                }
                else if(line.every(cell => cell === "X")){
                    gameOver = true;
                    wPlayer[xIndex].incrementScore();
                    DOMController.updateUIScore();
                    DOMController.showUIWinner(wPlayer[xIndex].getName());
                    return;
                }
            }
        }
        if(isBoardFull){
            DOMController.showUIWinner();
            gameOver = true;
        }
    }

    function resetGame(){
        gameOver = false;
    }

    function isGameOver(){
        return gameOver;
    }

    return {playerMove, checkWinner, resetGame, isGameOver}
})();

//IFFE for the DOM 
const DOMController = (function (){
    const board = GameBoard.getBoard();
    const dialog = document.querySelector('dialog');
    const player = GamePlayers.getPlayer();
    const name1 = document.getElementById('player1-name');
    const name2 = document.getElementById('player2-name');
    const turn = document.querySelector('.turn');
    const btnStart = document.querySelector('.start-game');
    const btnReset = document.querySelector('.reset-game');
    const btnSubmit = document.querySelector('.btn-submit');
    const btnCancel = document.querySelector('.btn-cancel');
    const cells = document.querySelectorAll('.cell');
    const cellsArray = Array.from(cells);
    //Get the size dynamically in order to iterate through the Nodelist
    const size = Math.sqrt(cellsArray.length);
    const playerLeft = document.querySelector('.player-left');
    const playerRight = document.querySelector('.player-right');
    const player1Name = document.createElement('span');
    const player2Name = document.createElement('span');
    const player1Score = document.createElement('span');
    const player2Score = document.createElement('span');
    player1Name.className = 'name1-span';
    player2Name.className = 'name2-span';
    player1Score.className = 'score1-span';
    player2Score.className = 'score2-span';
    let index = 0;
    
    //Iterate through each cell to assign a dataset for col and row
    for(let row = 0; row < size; row++){
        for(let col = 0; col < size; col++){
            cellsArray[index].dataset.row = row;
            cellsArray[index].dataset.col = col;
            index++;
        }
    }

    function currentplayer(){
        return GamePlayers.getCurrentPlayer();
    }

    //Event listener when each cell is clicked the value is assigned
    function cellEvent(e) {
        const cell = e.currentTarget;
        const cellsRow = parseInt(cell.dataset.row);
        const cellsCol = parseInt(cell.dataset.col);
    
        if (cell.textContent === "") {
            GameController.playerMove(cellsRow, cellsCol);
            cell.textContent = board[cellsRow][cellsCol];
    
            // Only update turn text if game not over
            turn.textContent = GameController.isGameOver?.() 
                ? turn.textContent 
                : `${currentplayer().getName()}'s turn...`;
        } else {
            alert('Cell already taken!');
        }
    }

    //Remove and attach event listener, this is to avoid having more than one event listener when clicking reset button
    function updateBoard(){
        cellsArray.forEach(cell => {
            cell.removeEventListener('click', cellEvent);
            cell.addEventListener('click', cellEvent);
        });
        
    }

    function clearBoardUI() {
        let index = 0;
        for(let row = 0; row < size; row++){
            for(let col = 0; col < size; col++){
                board[row][col] = null;
                cellsArray[index].textContent = "";
                index++;
            }
        }
    }

    btnStart.addEventListener('click', () => {
        dialog.showModal();
        btnSubmit.addEventListener('click', () => {
            if(name1.value === "" || name2.value === ""){
                return;
            } else {
                const isBoardEmpty = board.flat().every(cell => cell === null);
                if(!isBoardEmpty){
                    clearBoardUI();      
                    const playerIndex = player.indexOf(currentplayer());
                    if(playerIndex === 1){
                        GamePlayers.switchPlayer();
                    }
                    turn.textContent = `${currentplayer().getName()}'s turn...`;
                }
                GameController.resetGame();
                GamePlayers.setName(0, name1.value);
                GamePlayers.setName(1, name2.value);
                GamePlayers.setNewScore();
                player1Name.textContent = name1.value;
                player2Name.textContent = name2.value;
                player1Score.textContent = " Score: " + player[0].getScore();
                player2Score.textContent = " Score: " + player[1].getScore();
                playerLeft.appendChild(player1Name);
                playerRight.appendChild(player2Name);
                playerLeft.appendChild(player1Score);
                playerRight.appendChild(player2Score);
                turn.textContent = `${currentplayer().getName()}'s turn...`;
                updateBoard();
            } 
        });
        btnCancel.addEventListener('click', () => {
            dialog.close();
            name1.value = "";
            name2.value = "";
        });
    });

    btnReset.addEventListener('click', () => {
        const isBoardEmpty = board.flat().every(cell => cell === null);
        if(!isBoardEmpty){
            clearBoardUI();
            const playerIndex = player.indexOf(currentplayer());
            if(playerIndex === 1){
                GamePlayers.switchPlayer();
            }
            turn.textContent = `${currentplayer().getName()}'s turn...`;
        }
        GameController.resetGame();
        updateBoard();
    });

    function updateUIScore(){
        player1Score.textContent = " Score: " + player[0].getScore();
        player2Score.textContent = " Score: " + player[1].getScore();
    }

    function showUIWinner(name){
        const isBoardFull = board.flat().every(cell => cell !== null);
        if(isBoardFull){
            turn.textContent = "It's a draw!";
        }else{
            turn.textContent = name + " Wins!";
        }
        
    }

    return{updateUIScore, showUIWinner}
})();