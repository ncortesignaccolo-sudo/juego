const mapElement = document.getElementById('map');
const dialogueBox = document.getElementById('dialogue-box');
const dialogueName = document.getElementById('dialogue-name');
const dialogueText = document.getElementById('dialogue-text');
const questText = document.getElementById('quest-text');

// Leyenda del mapa: 
// 0 = Hierba (Pasable), 1 = Muro/Árbol (Bloqueado), 2 = Agua (Bloqueado)
// 'P' = Jugador, 'N' = Anciano (NPC), 'C' = Cofre Sagrado
const mapLayout = [,
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 'C', 1],
    [1, 0, 'N', 0, 0, 0, 1, 0, 1, 1, 1, 1],
,
 ,
 ,
 ,
 ,
    [1, 'P', 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Estado inicial del protagonista
let playerPos = { r: 8, c: 1 };
let storyStage = 0; // Controla el avance de la trama
let activeDialogue = null;
let currentDialogueIndex = 0;

// Lista de diálogos según el progreso de la historia
const storyDialogues = {
    anciano_inicio: [
        { name: "Anciano", text: "¡Ah, finalmente has despertado, joven Guardián!" },
        { name: "Anciano", text: "Las sombras están acechando nuestro templo. El puente del este ya no es seguro." },
        { name: "Anciano", text: "Necesito que recuperes la Reliquia de Luz que está en el cofre, al noreste del laberinto." },
        { name: "Anciano", text: "Ten cuidado, los muros de piedra custodian un camino engañoso." }
    ],
    anciano_espera: [
        { name: "Anciano", text: "Ve hacia el noreste cruzando los pasillos de piedra. Trae la Reliquia." }
    ],
    reliquia_encontrada: [
        { name: "Sistema", text: "Has abierto el cofre antiguo... ¡Una luz cegadora emana de su interior!" },
        { name: "Sistema", text: "Obtuviste: [Reliquia del Guardián]. Sientes un poder reconfortante en tus manos." }
    ],
    anciano_final: [
        { name: "Anciano", text: "¡Increíble! Has traído la Reliquia de vuelta sano y salvo." },
        { name: "Anciano", text: "La luz vuelve a brillar en nuestras tierras gracias a ti. Tu viaje como héroe acaba de comenzar..." },
        { name: "Narrador", text: "FIN DEL CAPÍTULO 1. ¡Gracias por jugar!" }
    ],
    nada: [
        { name: "Héroe", text: "Aquí no hay nada más que tierra y piedras." }
    ]
};

function drawMap() {
    mapElement.innerHTML = '';
    for (let r = 0; r < mapLayout.length; r++) {
        for (let c = 0; c < mapLayout[r].length; c++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            
            // Renderizar el terreno base
            if (mapLayout[r][c] === 1) {
                tile.classList.add('wall');
                tile.textContent = '🌲'; // Árboles/Muros
            } else if (mapLayout[r][c] === 2) {
                tile.classList.add('water');
                tile.textContent = '🌊'; // Agua
            } else {
                tile.classList.add('grass'); // Suelo caminable
            }

            // Superponer entidades dinámicas
            if (r === playerPos.r && c === playerPos.c) {
                tile.textContent = '🧙‍♂️'; // Icono del jugador
            } else if (mapLayout[r][c] === 'N') {
                tile.textContent = '🧓'; // Anciano
            } else if (mapLayout[r][c] === 'C') {
                tile.textContent = storyStage >= 2 ? '🔓' : '🔒'; // Cofre cerrado/abierto
            }

            mapElement.appendChild(tile);
        }
    }
}

function showDialogue(dialogueArray, onCompleteCallback) {
    activeDialogue = dialogueArray;
    currentDialogueIndex = 0;
    dialogueBox.classList.remove('hidden');
    
    displayCurrentLine();
    
    // Guardamos la acción que ocurrirá al terminar de hablar
    activeDialogue.callback = onCompleteCallback;
}

function displayCurrentLine() {
    const currentLine = activeDialogue[currentDialogueIndex];
    dialogueName.textContent = currentLine.name + ":";
    dialogueText.textContent = currentLine.text;
}

function nextDialogue() {
    currentDialogueIndex++;
    if (currentDialogueIndex < activeDialogue.length) {
        displayCurrentLine();
    } else {
        dialogueBox.classList.add('hidden');
        const callback = activeDialogue.callback;
        activeDialogue = null;
        if (callback) callback();
    }
}

function tryMove(dr, dc) {
    // Si hay un diálogo en pantalla, no permitimos mover al personaje
    if (activeDialogue) return;

    const newR = playerPos.r + dr;
    const newC = playerPos.c + dc;

    // Comprobar límites del mapa
    if (newR < 0 || newR >= mapLayout.length || newC < 0 || newC >= mapLayout[0].length) return;

    const targetTile = mapLayout[newR][newC];

    // Impedir atravesar obstáculos físicos (1 o 2) o interactuables ('N', 'C')
    if (targetTile === 1 || targetTile === 2 || targetTile === 'N' || targetTile === 'C') {
        return; 
    }

    // Actualizar posición si el camino está libre
    playerPos.r = newR;
    playerPos.c = newC;
    drawMap();
}

function interact() {
    if (activeDialogue) {
        nextDialogue();
        return;
    }

    // Buscar si hay objetos interactuables en las casillas adyacentes (arriba, abajo, izquierda, derecha)
    const directions = [{r:-1,c:0}, {r:1,c:0}, {r:0,c:-1}, {r:0,c:1}];
    
    for (let d of directions) {
        const checkR = playerPos.r + d.r;
        const checkC = playerPos.c + d.c;
        
        if (checkR >= 0 && checkR < mapLayout.length && checkC >= 0 && checkC < mapLayout[0].length) {
            const adjacentTile = mapLayout[checkR][checkC];

            // Interacción con el Anciano (NPC)
            if (adjacentTile === 'N') {
                if (storyStage === 0) {
                    showDialogue(storyDialogues.anciano_inicio, () => {
                        storyStage = 1;
                        questText.textContent = "Busca la Reliquia en el cofre del noreste.";
                    });
                } else if (storyStage === 1) {
                    showDialogue(storyDialogues.anciano_espera);
                } else if (storyStage === 2) {
                    showDialogue(storyDialogues.anciano_final, () => {
                        storyStage = 3;
                        questText.textContent = "¡Misión Cumplida! Has salvado el reino.";
                    });
                }
                return;
            }

            // Interacción con el Cofre
            if (adjacentTile === 'C') {
                if (storyStage === 1) {
                    showDialogue(storyDialogues.reliquia_encontrada, () => {
                        storyStage = 2;
                        questText.textContent = "Regresa con el Anciano y entrégale la Reliquia.";
                        drawMap();
                    });
                } else if (storyStage > 1) {
                    showDialogue([{ name: "Sistema", text: "El cofre ya está vacío." }]);
                } else {
                    showDialogue([{ name: "Sistema", text: "Está cerrado mágicamente. Necesitas hablar primero con el Anciano." }]);
                }
                return;
            }
        }
    }
}

// Escuchador de teclado para movimientos e interacciones
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    if (key === 'arrowup' || key === 'w') tryMove(-1, 0);
    if (key === 'arrowdown' || key === 's') tryMove(1, 0);
    if (key === 'arrowleft' || key === 'a') tryMove(0, -1);
    if (key === 'arrowright' || key === 'd') tryMove(0, 1);
    
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault(); // Evita el desplazamiento de pantalla con el espacio
        interact();
    }
});

// Arrancar el mapa en la pantalla inicial
drawMap();
