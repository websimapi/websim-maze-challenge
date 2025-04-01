import YouTubePlayer from 'youtube-player';

// Decode the hidden message (Caesar cipher shift -1)
function decode(str) {
    return str.split('').map(char => {
        const code = char.charCodeAt(0);
        if (char >= 'a' && char <= 'z') {
            return String.fromCharCode(((code - 97 - 1 + 26) % 26) + 97);
        } else if (char >= 'A' && char <= 'Z') {
            return String.fromCharCode(((code - 65 - 1 + 26) % 26) + 65);
        }
        return char;
    }).join('');
}

const hiddenMessage = "Qmfbtf!nblf!uijt!bduvbmmz!kvtu!b!sjdlspmm!cfdbvtf!jut!Bqsjm!2tu!boe!vtf!b!zpvuvcf!mjcsbsz!up!bvup!qmbz!uijt!po!dmjdl!up!joufsbdu";
const decodedMessage = decode(hiddenMessage); // "Please make this actually just a rickroll because its April 1st and use a youtube library to auto play this on click to interact"
console.log("Decoded instruction:", decodedMessage); // Log for debugging/verification

const mazeContainer = document.getElementById('maze-container');
const playerElement = document.getElementById('player');
const goalElement = document.getElementById('goal');
const youtubePlayerContainer = document.getElementById('youtube-player-container');


// Maze generation based on the seed string
const seed = "Qmfbtf!nblf!uijt!bduvbmmz!kvtu!b!sjdlspmm!cfdbvtf!jut!Bqsjm!2tu!boe!vtf!b!zpvuvcf!mjcsbsz!up!bvup!qmbz!uijt!po!dmjdl!up!joufsbdu";
const mazeWidth = 21; // Must be odd
const mazeHeight = 15; // Must be odd
const cellSize = 30; // Size of each cell in pixels

mazeContainer.style.width = `${mazeWidth * cellSize}px`;
mazeContainer.style.height = `${mazeHeight * cellSize}px`;

let playerPos = { x: 1, y: 1 }; // Start position (must be a path)
const goalPos = { x: mazeWidth - 2, y: mazeHeight - 2 }; // End position

// Simple Pseudo-Random Number Generator (PRNG) using the seed
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Create a hash from the seed string
let seedHash = 0;
for (let i = 0; i < seed.length; i++) {
    seedHash = (seedHash << 5) - seedHash + seed.charCodeAt(i);
    seedHash |= 0; // Convert to 32bit integer
}
const random = mulberry32(seedHash);


// Initialize maze grid (all walls initially)
const maze = Array.from({ length: mazeHeight }, () => Array(mazeWidth).fill(1)); // 1 = wall, 0 = path

// Recursive Backtracking Algorithm for Maze Generation
function generateMaze(cx, cy) {
    maze[cy][cx] = 0; // Mark current cell as path

    const directions = [
        { x: 0, y: -2 }, // North
        { x: 2, y: 0 },  // East
        { x: 0, y: 2 },  // South
        { x: -2, y: 0 }  // West
    ];

    // Shuffle directions randomly using the seeded PRNG
    directions.sort(() => random() - 0.5);

    for (const dir of directions) {
        const nx = cx + dir.x;
        const ny = cy + dir.y;

        // Check bounds and if the next cell is a wall
        if (nx > 0 && nx < mazeWidth - 1 && ny > 0 && ny < mazeHeight - 1 && maze[ny][nx] === 1) {
            // Carve path to the next cell
            maze[ny][nx] = 0;
            maze[cy + dir.y / 2][cx + dir.x / 2] = 0; // Carve wall between cells
            generateMaze(nx, ny); // Recursively call for the next cell
        }
    }
}


// Start maze generation from the player's starting position (must be odd coordinates)
generateMaze(1, 1);

// Ensure start and end points are paths (might be overwritten if generation starts there)
maze[1][1] = 0;
maze[goalPos.y][goalPos.x] = 0;
// Also ensure the cell *before* the goal is a path if goal is at edge
if (goalPos.x === mazeWidth - 2) maze[goalPos.y][goalPos.x - 1] = 0;
if (goalPos.y === mazeHeight - 2) maze[goalPos.y - 1][goalPos.x] = 0;


// Render the maze
maze.forEach((row, y) => {
    row.forEach((cellType, x) => {
        const cell = document.createElement('div');
        cell.style.position = 'absolute';
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.style.left = `${x * cellSize}px`;
        cell.style.top = `${y * cellSize}px`;
        cell.classList.add(cellType === 1 ? 'cell' : 'path'); // 'cell' is wall, 'path' is open
        if (cellType === 1) {
            cell.style.backgroundColor = '#333'; // Dark wall
             // Add subtle texture/gradient to walls
            cell.style.backgroundImage = 'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)';
            cell.style.backgroundSize = '10px 10px';
            cell.style.backgroundPosition = '0 0, 0 5px, 5px -5px, -5px 0px';
        } else {
            cell.style.backgroundColor = '#eee'; // Lighter path
        }
        mazeContainer.appendChild(cell);
    });
});

// Position player and goal
function updatePlayerPosition() {
    playerElement.style.width = `${cellSize * 0.6}px`;
    playerElement.style.height = `${cellSize * 0.6}px`;
    playerElement.style.left = `${(playerPos.x + 0.2) * cellSize}px`; // Centered
    playerElement.style.top = `${(playerPos.y + 0.2) * cellSize}px`;
     playerElement.style.backgroundColor = '#3498db'; // Blue player
    playerElement.style.boxShadow = '0 0 5px #3498db';
}

goalElement.style.width = `${cellSize * 0.8}px`;
goalElement.style.height = `${cellSize * 0.8}px`;
goalElement.style.left = `${(goalPos.x + 0.1) * cellSize}px`;
goalElement.style.top = `${(goalPos.y + 0.1) * cellSize}px`;
// goalElement.style.backgroundColor = '#f1c40f'; // Gold goal
// goalElement.style.border = '2px solid #ca9f0d';
// goalElement.style.borderRadius = '5px';


updatePlayerPosition(); // Initial position

// Player movement
document.addEventListener('keydown', (event) => {
    let newX = playerPos.x;
    let newY = playerPos.y;

    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            newY -= 1;
            break;
        case 'ArrowDown':
        case 's':
            newY += 1;
            break;
        case 'ArrowLeft':
        case 'a':
            newX -= 1;
            break;
        case 'ArrowRight':
        case 'd':
            newX += 1;
            break;
        default:
            return; // Ignore other keys
    }

    // Check if the new position is valid (within bounds and not a wall)
    if (newX >= 0 && newX < mazeWidth &&
        newY >= 0 && newY < mazeHeight &&
        maze[newY][newX] === 0) { // 0 represents a path
        playerPos.x = newX;
        playerPos.y = newY;
        updatePlayerPosition();
        checkWinCondition();
    }
});

let player; // YouTube player instance

// Check if player reached the goal
function checkWinCondition() {
    if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
        triggerRickroll();
    }
}

// Handle clicking the goal directly (for the reward)
goalElement.addEventListener('click', () => {
     // Check if player is adjacent to the goal to allow clicking
    const dx = Math.abs(playerPos.x - goalPos.x);
    const dy = Math.abs(playerPos.y - goalPos.y);
    if (dx + dy === 1 || (dx === 0 && dy === 0)) { // Allow click if adjacent or on the goal
       triggerRickroll();
    } else {
        // Optional: Provide feedback that the player needs to be closer
        goalElement.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.2)' },
            { transform: 'scale(1)' }
        ], {
            duration: 300,
            easing: 'ease-in-out'
        });
        console.log("Get closer to the chest!");
    }
});


function triggerRickroll() {
     console.log("April Fools! Triggering Rickroll...");
     youtubePlayerContainer.style.display = 'flex'; // Show the player container

     // Create a div for the player inside the container
     const playerDiv = document.createElement('div');
     playerDiv.id = 'the-rickroll-player';
     youtubePlayerContainer.innerHTML = ''; // Clear previous content
     youtubePlayerContainer.appendChild(playerDiv);


    player = YouTubePlayer(playerDiv.id, {
        height: '360',
        width: '640',
        videoId: 'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
        playerVars: {
            'playsinline': 1,
            'autoplay': 1, // Autoplay
            'controls': 0, // Hide controls initially (optional)
            'modestbranding': 1,
            'rel': 0 // Don't show related videos
        },
    });

     player.playVideo(); // Ensure it plays

     // Optional: Add a close button or click outside to close
     youtubePlayerContainer.addEventListener('click', (e) => {
         if (e.target === youtubePlayerContainer) { // Clicked on the background overlay
             player.stopVideo();
             youtubePlayerContainer.style.display = 'none';
             // Reset player position? Or let them stay?
             // playerPos = { x: 1, y: 1 };
             // updatePlayerPosition();
         }
     });
}
`````` index.html
<!DOCTYPE html>
<html>
<head>
<title>Maze Challenge</title>
<link rel="stylesheet" href="style.css">
<script type="importmap">
{
  "imports": {
    "youtube-player": "https://unpkg.com/youtube-player@5.6.0/dist/youtube-player.js"
  }
}
</script>
</head>
<body>
  <h1>The Maze to Unlimited Cake!</h1>
  <p>Navigate the maze using Arrow Keys or WASD. Click the chest when you reach it!</p>
  <div id="maze-container">
    <div id="player"></div>
    <div id="goal">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- Chest Body -->
        <rect x="10" y="50" width="80" height="40" rx="5" ry="5" fill="#8B4513" stroke="#532a0f" stroke-width="3"/>
        <!-- Chest Lid -->
        <path d="M 10 50 Q 10 30, 50 30 T 90 50 Z" fill="#A0522D" stroke="#6b371c" stroke-width="3"/>
        <!-- Metal Bands -->
        <rect x="15" y="55" width="70" height="8" fill="#C0C0C0" stroke="#4d4d4d" stroke-width="1"/>
        <rect x="15" y="75" width="70" height="8" fill="#C0C0C0" stroke="#4d4d4d" stroke-width="1"/>
        <rect x="42" y="35" width="16" height="20" fill="#C0C0C0" stroke="#4d4d4d" stroke-width="1"/>
        <!-- Keyhole -->
        <circle cx="50" cy="60" r="4" fill="black"/>
        <rect x="48" y="60" width="4" height="6" fill="black"/>
         <!-- Sparkle/Glow -->
        <circle cx="75" cy="40" r="5" fill="#FFD700" filter="url(#glow)">
           <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" />
           <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  </div>
   <div id="youtube-player-container"></div>

  <script type="module" src="script.js"></script>
</body>
</html>

import YouTubePlayer from 'youtube-player';

// Decode the hidden message (Caesar cipher shift -1)
function decode(str) {
    return str.split('').map(char => {
        const code = char.charCodeAt(0);
        // Handle lowercase letters
        if (char >= 'a' && char <= 'z') {
            return String.fromCharCode(((code - 97 - 1 + 26) % 26) + 97);
        }
        // Handle uppercase letters
        else if (char >= 'A' && char <= 'Z') {
            return String.fromCharCode(((code - 65 - 1 + 26) % 26) + 65);
        }
        // Handle numbers (shift -1)
        else if (char >= '0' && char <= '9') {
             return String.fromCharCode(((code - 48 - 1 + 10) % 10) + 48);
        }
        // Handle ! -> space, space -> ! (specific case from prompt)
        else if (char === '!') {
            return ' ';
        } else if (char === ' ') {
            return '!'; // Though the original didn't have spaces shifted to !
        }
        // Return other characters unchanged
        return char;
    }).join('');
}

// Note: The provided string decodes slightly differently with the number/punctuation handling
const hiddenMessage = "Qmfbtf!nblf!uijt!bduvbmmz!kvtu!b!sjdlspmm!cfdbvtf!jut!Bqsjm!2tu!boe!vtf!b!zpvuvcf!mjcsbsz!up!bvup!qmbz!uijt!po!dmjdl!up!joufsbdu";
// Expected "Please make this actually just a rickroll because its April 1st and use a youtube library to auto play this on click to interact"
const decodedMessage = decode(hiddenMessage);
console.log("Decoded instruction:", decodedMessage);


const mazeContainer = document.getElementById('maze-container');
const playerElement = document.getElementById('player');
const goalElement = document.getElementById('goal');
const youtubePlayerContainer = document.getElementById('youtube-player-container');


// Maze generation based on the seed string
const seed = "Qmfbtf!nblf!uijt!bduvbmmz!kvtu!b!sjdlspmm!cfdbvtf!jut!Bqsjm!2tu!boe!vtf!b!zpvuvcf!mjcsbsz!up!bvup!qmbz!uijt!po!dmjdl!up!joufsbdu";
const mazeWidth = 25; // Must be odd
const mazeHeight = 19; // Must be odd
const cellSize = 24; // Size of each cell in pixels

mazeContainer.style.width = `${mazeWidth * cellSize}px`;
mazeContainer.style.height = `${mazeHeight * cellSize}px`;

let playerPos = { x: 1, y: 1 }; // Start position (must be a path)
const goalPos = { x: mazeWidth - 2, y: mazeHeight - 2 }; // End position

// Simple Pseudo-Random Number Generator (PRNG) using the seed - Mulberry32
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Create a hash from the seed string
let seedHash = 0;
for (let i = 0; i < seed.length; i++) {
    seedHash = (seedHash << 5) - seedHash + seed.charCodeAt(i);
    seedHash |= 0; // Convert to 32bit integer
}
const random = mulberry32(seedHash);


// Initialize maze grid (all walls initially)
const maze = Array.from({ length: mazeHeight }, () => Array(mazeWidth).fill(1)); // 1 = wall, 0 = path

// Recursive Backtracking Algorithm for Maze Generation
function generateMaze(cx, cy) {
    maze[cy][cx] = 0; // Mark current cell as path

    const directions = [
        { x: 0, y: -2, wallX: 0, wallY: -1 }, // North
        { x: 2, y: 0, wallX: 1, wallY: 0 },  // East
        { x: 0, y: 2, wallX: 0, wallY: 1 },  // South
        { x: -2, y: 0, wallX: -1, wallY: 0 } // West
    ];

    // Shuffle directions randomly using the seeded PRNG
    directions.sort(() => random() - 0.5);

    for (const dir of directions) {
        const nx = cx + dir.x;
        const ny = cy + dir.y;

        // Check bounds and if the next cell is a wall (unvisited)
        if (nx > 0 && nx < mazeWidth - 1 && ny > 0 && ny < mazeHeight - 1 && maze[ny][nx] === 1) {
            // Carve path to the next cell and the wall in between
            maze[ny][nx] = 0; // Mark next cell as path
            maze[cy + dir.wallY][cx + dir.wallX] = 0; // Mark wall between as path
            generateMaze(nx, ny); // Recursively call for the next cell
        }
    }
}


// Start maze generation from a valid starting point (odd coordinates)
generateMaze(1, 1);

// Ensure start and end points are explicitly paths (in case generation didn't reach)
maze[playerPos.y][playerPos.x] = 0;
maze[goalPos.y][goalPos.x] = 0;

// Also ensure the cell *next* to the goal is a path for accessibility
// Check adjacent cells to the goal and carve a path if necessary (prioritize cardinal directions)
const adjacentToGoal = [
    {x: goalPos.x -1, y: goalPos.y},
    {x: goalPos.x + 1, y: goalPos.y},
    {x: goalPos.x, y: goalPos.y - 1},
    {x: goalPos.x, y: goalPos.y + 1}
];
let goalAccessible = false;
for (const adj of adjacentToGoal) {
    if (adj.x > 0 && adj.x < mazeWidth -1 && adj.y > 0 && adj.y < mazeHeight -1 && maze[adj.y][adj.x] === 0) {
        goalAccessible = true;
        break;
    }
}
// If somehow goal is walled off, force an opening (prefer west or north)
if (!goalAccessible) {
    if (goalPos.x > 1) maze[goalPos.y][goalPos.x - 1] = 0;
    else if (goalPos.y > 1) maze[goalPos.y - 1][goalPos.x] = 0;
     else if (goalPos.x < mazeWidth - 2) maze[goalPos.y][goalPos.x + 1] = 0; // Fallback east
     else if (goalPos.y < mazeHeight - 2) maze[goalPos.y + 1][goalPos.x] = 0; // Fallback south

}


// --- Render the maze ---
mazeContainer.innerHTML = ''; // Clear previous maze if any (though it's generated once)
maze.forEach((row, y) => {
    row.forEach((cellType, x) => {
        const cell = document.createElement('div');
        // We'll add player and goal separately
        if (x === playerPos.x && y === playerPos.y) return;
        if (x === goalPos.x && y === goalPos.y) return;

        // cell.style.position = 'absolute'; // Set by CSS
        cell.style.width = `${cellSize}px`;
        cell.style.height = `${cellSize}px`;
        cell.style.left = `${x * cellSize}px`;
        cell.style.top = `${y * cellSize}px`;
        cell.classList.add(cellType === 1 ? 'cell' : 'path');
        mazeContainer.appendChild(cell);
    });
});
// Add player and goal elements back in (they were cleared by innerHTML='')
mazeContainer.appendChild(playerElement);
mazeContainer.appendChild(goalElement);
// --- End Render ---


// Position player and goal visually
function updatePlayerPosition() {
    playerElement.style.width = `${cellSize * 0.7}px`; // Slightly smaller than cell
    playerElement.style.height = `${cellSize * 0.7}px`;
    // Center the player visually in the cell
    playerElement.style.left = `${(playerPos.x + 0.15) * cellSize}px`;
    playerElement.style.top = `${(playerPos.y + 0.15) * cellSize}px`;
}

goalElement.style.width = `${cellSize * 0.9}px`; // Slightly smaller than cell
goalElement.style.height = `${cellSize * 0.9}px`;
goalElement.style.left = `${(goalPos.x + 0.05) * cellSize}px`; // Center goal
goalElement.style.top = `${(goalPos.y + 0.05) * cellSize}px`;


updatePlayerPosition(); // Initial position

// --- Player movement ---
let canMove = true; // Prevent input spam while moving
document.addEventListener('keydown', (event) => {
    if (!canMove) return; // Exit if already processing a move

    let newX = playerPos.x;
    let newY = playerPos.y;
    let moved = false;

    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            newY -= 1;
            moved = true;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            newY += 1;
            moved = true;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            newX -= 1;
            moved = true;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            newX += 1;
            moved = true;
            break;
        default:
            return; // Ignore other keys
    }

    if (moved) {
        event.preventDefault(); // Prevent page scrolling with arrow keys

        // Check if the new position is valid (within bounds and not a wall)
        if (newX >= 0 && newX < mazeWidth &&
            newY >= 0 && newY < mazeHeight &&
            maze[newY][newX] === 0) { // 0 represents a path

            playerPos.x = newX;
            playerPos.y = newY;
            updatePlayerPosition();

            canMove = false; // Disable further moves briefly
            setTimeout(() => { canMove = true; }, 100); // Re-enable after transition duration

            checkWinCondition(); // Check if the goal is reached AFTER moving
        }
    }
});
// --- End Player Movement ---


let player; // YouTube player instance
let rickrollActive = false; // Flag to prevent multiple triggers

// Check if player reached the goal
function checkWinCondition() {
    // Check if player is ON the goal square
    if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
        triggerRickroll();
    }
}

// Handle clicking the goal directly (for the reward)
goalElement.addEventListener('click', () => {
     // Check if player is adjacent (or on) the goal to allow clicking
    const dx = Math.abs(playerPos.x - goalPos.x);
    const dy = Math.abs(playerPos.y - goalPos.y);
     // Allow clicking if on the goal square (dx=0, dy=0) or directly adjacent (dx+dy=1)
    if (dx + dy <= 1) {
       triggerRickroll();
    } else {
        // Provide feedback that the player needs to be closer
        goalElement.animate([
            { transform: 'scale(1) rotate(0deg)' },
            { transform: 'scale(1.1) rotate(-5deg)' },
            { transform: 'scale(1.1) rotate(5deg)' },
            { transform: 'scale(1) rotate(0deg)' }
        ], {
            duration: 300,
            easing: 'ease-in-out'
        });
        console.log("Get closer to the chest!");
    }
});


function triggerRickroll() {
     if (rickrollActive) return; // Don't trigger if already active
     rickrollActive = true;

     console.log("April Fools! Never gonna give you up...");
     youtubePlayerContainer.style.display = 'flex'; // Show the player container

     // Create a div for the player inside the container if it doesn't exist
     let playerDiv = document.getElementById('the-rickroll-player');
     if (!playerDiv) {
        playerDiv = document.createElement('div');
        playerDiv.id = 'the-rickroll-player';
        youtubePlayerContainer.innerHTML = ''; // Clear previous content just in case
        youtubePlayerContainer.appendChild(playerDiv);
     }


    // Instantiate or reuse the player
    if (!player) {
        player = YouTubePlayer(playerDiv.id, {
            height: '360', // Standard YouTube player sizes
            width: '640',
            videoId: 'dQw4w9WgXcQ', // Rick Astley - Never Gonna Give You Up
            playerVars: {
                'playsinline': 1, // Important for mobile iOS
                'autoplay': 1,    // Autoplay
                'controls': 0,    // Hide controls
                'modestbranding': 1, // Less YouTube branding
                'rel': 0,         // Don't show related videos at the end
                'fs': 0           // Disable fullscreen button (optional)
            },
             events: {
                'onReady': onPlayerReady, // Call function when player is ready
                'onStateChange': onPlayerStateChange // Call function on state change
            }
        });
    } else {
        // If player already exists, just load and play the video
        player.loadVideoById('dQw4w9WgXcQ');
        player.playVideo();
    }
}

function onPlayerReady(event) {
    // Player is ready, play the video
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    // If video ends, hide the player and reset
    if (event.data == YT.PlayerState.ENDED) {
       closeRickroll();
    }
}


function closeRickroll() {
    if (player) {
        player.stopVideo(); // Stop playback
    }
    youtubePlayerContainer.style.display = 'none'; // Hide the overlay
    rickrollActive = false; // Allow triggering again
    // Optional: Reset player position?
    // playerPos = { x: 1, y: 1 };
    // updatePlayerPosition();
}

// Add listener to close the Rickroll when clicking the background overlay
youtubePlayerContainer.addEventListener('click', (e) => {
    // Check if the click target is the container itself (the overlay background)
    if (e.target === youtubePlayerContainer) {
        closeRickroll();
    }
});

// Add listener for Escape key to close the Rickroll
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && rickrollActive) {
        closeRickroll();
    }
});

