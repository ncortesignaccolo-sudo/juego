const boardElement = document.getElementById('board');
const turnIndicator = document.getElementById('turn-indicator');

const initialBoard = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
];

let board = JSON.parse(JSON.stringify(initialBoard));
let selectedSquare = null;
let currentTurn = 'white'; 

function getPieceColor(piece) {
    if (!piece) return null;
    const whitePieces = ['♖', '♘', '♗', '♕', '♔', '♙'];
    return whitePieces.includes(piece) ? 'white' : 'black';
}

function createBoard() {
    if (!boardElement) return;
    boardElement.innerHTML = '';
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.classList.add('square');
            
            if ((r + c) % 2 === 0) {
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }

            const piece = board[r][c];
            if (piece) {
                square.textContent = piece;
                square.classList.add(getPieceColor(piece) === 'white' ? 'white-piece' : 'black-piece');
            }

            if (selectedSquare && selectedSquare.row === r && selectedSquare.col === c) {
                square.classList.add('selected');
            }

            square.addEventListener('click', () => handleSquareClick(r, c));
            boardElement.appendChild(square);
        }
    }
}

// --- LÓGICA DE VALIDACIÓN DE MOVIMIENTOS ---

function isValidMove(fromR, fromC, toR, toC) {
    const piece = board[fromR][fromC];
    const targetPiece = board[toR][toC];
    
    // No se puede capturar una pieza del mismo color
    if (targetPiece && getPieceColor(piece) === getPieceColor(targetPiece)) {
        return false;
    }

    const rowDiff = toR - fromR;
    const colDiff = toC - fromC;
    const absRowDiff = Math.abs(rowDiff);
    const absColDiff = Math.abs(colDiff);

    // Mapeo genérico según el tipo de pieza (independiente de si es blanca o negra)
    switch (piece) {
        case '♙': // Peón Blanco
            if (colDiff === 0 && targetPiece === '') {
                if (rowDiff === -1) return true;
                if (fromR === 6 && rowDiff === -2 && board[5][fromC] === '') return true; // Salto inicial
            }
            if (rowDiff === -1 && absColDiff === 1 && targetPiece !== '') return true; // Captura
            return false;

        case '♟': // Peón Negro
            if (colDiff === 0 && targetPiece === '') {
                if (rowDiff === 1) return true;
                if (fromR === 1 && rowDiff === 2 && board[2][fromC] === '') return true; // Salto inicial
            }
            if (rowDiff === 1 && absColDiff === 1 && targetPiece !== '') return true; // Captura
            return false;

        case '♖': case '♜': // Torre
            if (fromR !== toR && fromC !== toC) return false; // Debe ser línea recta
            return isPathClear(fromR, fromC, toR, toC);

        case '♗': case '♝': // Alfil
            if (absRowDiff !== absColDiff) return false; // Debe ser diagonal
            return isPathClear(fromR, fromC, toR, toC);

        case '♘': case '♞': // Caballo
            return (absRowDiff === 2 && absColDiff === 1) || (absRowDiff === 1 && absColDiff === 2);

        case '♕': case '♛': // Reina
            if ((fromR === toR || fromC === toC) || (absRowDiff === absColDiff)) {
                return isPathClear(fromR, fromC, toR, toC);
            }
            return false;

        case '♔': case '♚': // Rey
            return absRowDiff <= 1 && absColDiff <= 1;

        default:
            return false;
    }
}

// Función auxiliar para comprobar si el camino está libre de obstáculos (para Torres, Alfiles y Reinas)
function isPathClear(fromR, fromC, toR, toC) {
    const stepR = toR === fromR ? 0 : (toR > fromR ? 1 : -1);
    const stepC = toC === fromC ? 0 : (toC > fromC ? 1 : -1);
    
    let currentR = fromR + stepR;
    let currentC = fromC + stepC;
    
    while (currentR !== toR || currentC !== toC) {
        if (board[currentR][currentC] !== '') {
            return false; // Hay una pieza en medio
        }
        currentR += stepR;
        currentC += stepC;
    }
    return true;
}

// --- CONTROLADOR DE CLICS ---

function handleSquareClick(row, col) {
    const clickedPiece = board[row][col];
    const clickedColor = getPieceColor(clickedPiece);

    if (selectedSquare) {
        // Si hace clic en otra de sus propias piezas, cambia la selección
        if (clickedColor === currentTurn) {
            selectedSquare = { row, col };
            createBoard();
            return;
        }

        // Validar si el movimiento es legal para esa pieza específica
        if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
            const sourcePiece = board[selectedSquare.row][selectedSquare.col];
            board[row][col] = sourcePiece;
            board[selectedSquare.row][selectedSquare.col] = '';
            
            selectedSquare = null;
            currentTurn = currentTurn === 'white' ? 'black' : 'white';
            turnIndicator.textContent = `Turno: ${currentTurn === 'white' ? 'Blancas' : 'Negras'}`;
        } else {
            // Si el movimiento no es válido, quitamos la selección de la pieza
            selectedSquare = null;
        }
        createBoard();
    } else {
        if (clickedColor === currentTurn) {
            selectedSquare = { row, col };
            createBoard();
        }
    }
}

createBoard();

// Inicializar el juego
createBoard();
