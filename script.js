const board = document.getElementById("board");
const piecesContainer = document.getElementById("pieces");
const message = document.getElementById("message");
const timerDisplay = document.getElementById("timer");
const closeBtn = document.getElementById("closeBtn");

let draggedPiece = null;
let timeLeft = 60;
let timerInterval = null;
let gameEnded = false;
let userName = "Player"; // Default ชื่อผู้ใช้

const positions = [
  { id: 1, bgPos: "0 0" },
  { id: 2, bgPos: "-100px 0" },
  { id: 3, bgPos: "-200px 0" },
  { id: 4, bgPos: "0 -100px" },
  { id: 5, bgPos: "-100px -100px" },
  { id: 6, bgPos: "-200px -100px" },
  { id: 7, bgPos: "0 -200px" },
  { id: 8, bgPos: "-100px -200px" },
  { id: 9, bgPos: "-200px -200px" },
];

async function initializeLiff() {
  try {
    await liff.init({ liffId: "2007868117-v7XkrPDn" });
    if (liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      userName = profile.displayName || "Player";
    }
  } catch (error) {
    console.error("LIFF initialization failed", error);
    userName = "Player";
  }
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function createBoard() {
  board.innerHTML = "";
  piecesContainer.innerHTML = "";

  positions.forEach((pos) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.id = pos.id;
    board.appendChild(cell);
  });

  const shuffled = shuffle([...positions]);
  shuffled.forEach((pos) => {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.draggable = true;
    piece.dataset.id = pos.id;
    piece.style.backgroundPosition = pos.bgPos;

    piece.addEventListener("dragstart", (e) => {
      draggedPiece = e.target;
    });

    piece.addEventListener("dragend", () => {
      draggedPiece = null;
    });

    piecesContainer.appendChild(piece);
  });
}

function checkWin() {
  const cells = board.querySelectorAll(".cell");
  for (let cell of cells) {
    if (!cell.firstChild || cell.firstChild.dataset.id !== cell.dataset.id) {
      return false;
    }
  }
  return true;
}

function startTimer() {
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  timerInterval = setInterval(() => {
    if (gameEnded) {
      clearInterval(timerInterval);
      return;
    }
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) {
      endGame(false);
    }
  }, 1000);
}

function endGame(win) {
  gameEnded = true;
  clearInterval(timerInterval);
  if (win) {
    message.textContent = `${userName} wins 🎉 Congratulations!`;
    message.classList.remove("fail");
  } else {
    message.textContent = `${userName} loses 😞 Try again!`;
    message.classList.add("fail");
  }
}

board.addEventListener("dragover", (e) => e.preventDefault());

board.addEventListener("drop", (e) => {
  if (gameEnded || !draggedPiece) return;

  const targetCell = e.target.closest(".cell");
  if (!targetCell) return;

  if (!targetCell.firstChild) {
    // ช่องว่าง ไม่มีชิ้นจิ๊กซอว์
    targetCell.appendChild(draggedPiece);
  } else if (targetCell.firstChild !== draggedPiece) {
    // ถ้าวางบนชิ้นอื่น ให้สลับชิ้นกัน
    const targetPiece = targetCell.firstChild;
    const draggedParent = draggedPiece.parentNode;

    targetCell.replaceChild(draggedPiece, targetPiece);
    draggedParent.appendChild(targetPiece);
  }

  if (checkWin()) {
    endGame(true);
  }
});

piecesContainer.addEventListener("dragover", (e) => e.preventDefault());
piecesContainer.addEventListener("drop", (e) => {
  if (gameEnded || !draggedPiece) return;
  piecesContainer.appendChild(draggedPiece);
});

closeBtn.addEventListener("click", () => {
  if (liff.isInClient()) {
    liff.closeWindow();
  } else {
    alert("Please open this link from the LINE app 🙏");
  }
});

window.onload = async () => {
  await initializeLiff();
  createBoard();
  startTimer();
};
