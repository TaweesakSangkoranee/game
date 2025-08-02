const board = document.getElementById("board");
const piecesContainer = document.getElementById("pieces");
const message = document.getElementById("message");
const timerDisplay = document.getElementById("timer");

let draggedPiece = null;
let timeLeft = 60;
let timerInterval = null;
let gameEnded = false;

const positions = Array.from({ length: 9 }, (_, i) => i);

// สร้างช่องเปล่าในบอร์ด 9 ช่อง
for (let i = 0; i < 9; i++) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.dataset.index = i;
  cell.addEventListener("dragover", e => e.preventDefault());
  cell.addEventListener("drop", handleDrop);

  // touch event สำหรับมือถือ
  cell.addEventListener("touchmove", e => e.preventDefault());
  cell.addEventListener("touchend", handleTouchDrop);
  board.appendChild(cell);
}

// สร้างชิ้นส่วนแบบสุ่มจากภาพเดียวกัน
shuffleArray(positions).forEach(i => {
  const piece = document.createElement("div");
  piece.className = "piece";
  piece.draggable = true;
  piece.dataset.correct = i;
  piece.style.backgroundPosition = `${-(i % 3) * 100}px ${-Math.floor(i / 3) * 100}px`;

  piece.addEventListener("dragstart", e => {
    draggedPiece = e.target;
  });

  // touch start สำหรับมือถือ
  piece.addEventListener("touchstart", e => {
    draggedPiece = e.target;
  });

  piecesContainer.appendChild(piece);
});

// ตั้งเวลา countdown 60 วินาที
timerInterval = setInterval(() => {
  if (gameEnded) return;
  timeLeft--;
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  if (timeLeft <= 0) {
    endGame(false);
  }
}, 1000);

// จัดการการวางชิ้นส่วนด้วย mouse drag-drop
function handleDrop(e) {
  if (gameEnded || !draggedPiece) return;

  const dropTarget = e.target;

  if (dropTarget.classList.contains("piece")) {
    // สลับตำแหน่งชิ้นส่วน
    const targetPiece = dropTarget;
    const fromCell = draggedPiece.parentNode;
    const toCell = targetPiece.parentNode;

    toCell.replaceChild(draggedPiece, targetPiece);
    fromCell.appendChild(targetPiece);

  } else if (dropTarget.classList.contains("cell")) {
    const existingPiece = dropTarget.firstChild;

    if (existingPiece && existingPiece !== draggedPiece) {
      const fromCell = draggedPiece.parentNode;
      dropTarget.replaceChild(draggedPiece, existingPiece);
      fromCell.appendChild(existingPiece);
    } else if (!existingPiece) {
      dropTarget.appendChild(draggedPiece);
    }
  } else if (dropTarget.id === "pieces") {
    if (draggedPiece.parentNode !== piecesContainer) {
      piecesContainer.appendChild(draggedPiece);
    }
  }

  draggedPiece = null;
  checkWin();
}

// จัดการการวางชิ้นส่วนด้วย touch (มือถือ)
function handleTouchDrop(e) {
  if (gameEnded) return;

  const touch = e.changedTouches[0];
  const elem = document.elementFromPoint(touch.clientX, touch.clientY);

  if (!draggedPiece || !elem) return;

  const fromCell = draggedPiece.parentNode;

  if (elem.classList.contains("piece")) {
    const targetPiece = elem;
    const toCell = targetPiece.parentNode;

    toCell.replaceChild(draggedPiece, targetPiece);
    fromCell.appendChild(targetPiece);

  } else if (elem.classList.contains("cell")) {
    const existingPiece = elem.firstChild;

    if (existingPiece) {
      elem.replaceChild(draggedPiece, existingPiece);
      if (fromCell.classList.contains("cell") || fromCell.id === "pieces") {
        fromCell.appendChild(existingPiece);
      }
    } else {
      elem.appendChild(draggedPiece);
    }

  } else if (elem.id === "pieces") {
    if (fromCell !== piecesContainer) {
      piecesContainer.appendChild(draggedPiece);
    }
  }

  draggedPiece = null;
  checkWin();
}

// เช็คว่าผู้เล่นจับชิ้นส่วนถูกตำแหน่งครบหรือยัง
function checkWin() {
  const cells = document.querySelectorAll(".cell");
  for (let cell of cells) {
    const piece = cell.firstChild;
    if (!piece) return;
    if (piece.dataset.correct !== cell.dataset.index) return;
  }
  endGame(true);
}

// จบเกม แสดงข้อความชนะหรือแพ้
function endGame(win) {
  gameEnded = true;
  clearInterval(timerInterval);
  if (win) {
    message.textContent = "🎉 You completed the puzzle!";
    message.classList.remove("fail");
  } else {
    message.textContent = "⏱️ Time's up! You lost.";
    message.classList.add("fail");
  }
}

// ฟังก์ชันสุ่มตำแหน่งชิ้นส่วน
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// เริ่มต้น LIFF และเชื่อมปุ่มปิด
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await liff.init({ liffId: "2007868117-v7XkrPDn" }); // ใส่ LIFF ID ที่ต้องการ

    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    const profile = await liff.getProfile();
    message.innerHTML = `👋 Hello, ${profile.displayName}`;

    const closeBtn = document.getElementById("closeBtn");
    closeBtn.addEventListener("click", () => {
      if (liff.isInClient()) {
        liff.closeWindow();
      } else {
        alert("This app is not running inside the LINE app.");
      }
    });

  } catch (err) {
    console.error("LIFF initialization error:", err);
    alert("Failed to initialize LINE LIFF.");
  }
});
