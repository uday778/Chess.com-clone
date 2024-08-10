const socket=io()
const chess=new Chess();
const boardElement= document.querySelector(".chessboard")

let draggedPiece=null;
let sourceSquare=null;
let playerRole=null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark");
            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                // Log the piece type and its assigned Unicode symbol
                // console.log(`Piece: ${square.type}, Color: ${square.color}, Unicode: ${getPieceUnicode(square)}`);

                pieceElement.addEventListener("dragstart", (event) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        event.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend", (event) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (event) => {
                event.preventDefault();
            });

            squareElement.addEventListener("drop", (event) => {
                const targetSquare = {
                    row: parseInt(squareElement.dataset.row),
                    col: parseInt(squareElement.dataset.col),
                };

                handleBoard(sourceSquare, targetSquare);
            });
            boardElement.appendChild(squareElement);
        });

    });
    if(playerRole==="b"){
        boardElement.classList.add("flipped");
    }
    // else{
    //     boardElement.classList.remove("flipped");
    // }
};

const handleBoard=(source,target)=>{
    const move={
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion:"q"
}
    
    socket.emit("move",move)
}

const getPieceUnicode = (piece) => {
    const unicodePiecesWhite = {
        p: '♙', // white pawn
        r: '♖', // white rook
        n: '♘', // white knight
        b: '♗', // white bishop
        q: '♕', // white queen
        k: '♔', // white king
    };

    const unicodePiecesBlack={
        p : '♟', // black pawn
        r : '♜', // black rook
        n : '♞', // black knight
        b : '♝', // black bishop
        q : '♛', // black queen
        k : '♚', // black king
    }

    if(piece.color==="w") return unicodePiecesWhite[piece.type]
    else if(piece.color==="b") return unicodePiecesBlack[piece.type]
    else return ""
};




socket.on("playerRole",(role)=>{
    playerRole=role
    renderBoard()
})

socket.on("spectatorRole",()=>{
    playerRole=null
    renderBoard()
})

socket.on("boardState",(fen)=>{
    chess.load(fen)
    renderBoard()
})

socket.on("move",(move)=>{
    chess.move(move)
    renderBoard()
})
renderBoard()






