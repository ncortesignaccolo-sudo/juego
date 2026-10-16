const boardElement = document.getElementById('board');
const turnIndicator = document.getElementById('turn-indicator');

// Estado inicial del tablero usando caracteres Unicode de ajedrez
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
let currentTurn = 'white'; // 'white' o 'black'

// Determinar el color de una pieza
function getPieceColor(piece) {
    if (!piece) return null;
    const whitePieces = ['♖', '♘', '♗', '♕', '♔', '♙'];
    return whitePieces.includes(piece) ? 'white' : 'black';
}

// Crear el tablero visual en el HTML
function createBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.classList.add('square');
            
            // Alternar colores de casillas
            if ((r + c) % 2 === 0) {
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }

            square.dataset.row = r;
            square.dataset.col = c;

            const piece = board[r][c];
            if (piece) {
                square.textContent = piece;
                square.classList.add(getPieceColor(piece) === 'white' ? 'white-piece' : 'black-piece');
            }

            // Guardar selección visual
            if (selectedSquare && selectedSquare.row === r && selectedSquare.col === c) {
                square.classList.add('selected');
            }

            square.addEventListener('click', () => handleSquareClick(r, c));
            boardElement.appendChild(square);
        }
    }
}

// Controlar los clics en las casillas
function handleSquareClick(row, col) {
    const clickedPiece = board[row][col];
    const clickedColor = getPieceColor(clickedPiece);

    // Si ya hay una pieza seleccionada
    if (selectedSquare) {
        // Permitir cambiar la selección si hace clic en otra pieza de su propio turno
        if (clickedColor === currentTurn) {
            selectedSquare = { row, col };
            createBoard();
            return;
        }

        // Mover la pieza a la nueva casilla (Movimiento libre básico)
        const sourcePiece = board[selectedSquare.row][selectedSquare.col];
        board[row][col] = sourcePiece;
        board[selectedSquare.row][selectedSquare.col] = '';
        
        // Limpiar selección y cambiar turno
        selectedSquare = null;
        currentTurn = currentTurn === 'white' ? 'black' : 'white';
        turnIndicator.textContent = `Turno: ${currentTurn === 'white' ? 'Blancas' : 'Negras'}`;
        
        createBoard();
    } else {
        // Seleccionar una pieza si coincide con el turno actual
        if (clickedColor === currentTurn) {
            selectedSquare = { row, col };
            createBoard();
        }
    }
}

// Inicializar el juego
createBoard();
