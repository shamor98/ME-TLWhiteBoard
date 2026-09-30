const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");

const drawBtn = document.getElementById("drawBtn");
const eraserBtn = document.getElementById("eraserBtn");
const textBtn = document.getElementById("textBtn");
const selectBtn = document.getElementById("selectBtn");
const clearBtn = document.getElementById("clearBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const saveBtn = document.getElementById("saveBtn");
const imageBtn = document.getElementById("imageBtn");
const imageUpload = document.getElementById("imageUpload");
const colorPicker = document.getElementById("colorPicker");
const shapeSelect = document.getElementById("shapeSelect");
const currentToolDisplay = document.getElementById("currentTool");

let tool = "draw";
let drawing = false;

let startX = 0;
let startY = 0;

let savedCanvasImage = null;
let selectingArea = false;
let selectionReady = false;
let movingSelection = false;

let selectionStartX = 0;
let selectionStartY = 0;

let selectionX = 0;
let selectionY = 0;
let selectionWidth = 0;
let selectionHeight = 0;

let selectionImage = null;
let selectionBackground = null;
let moveBackground = null;

let dragOffsetX = 0;
let dragOffsetY = 0;
let undoStack = [];
let redoStack = [];


// SAVE HISTORY
function saveHistory() {

    undoStack.push(canvas.toDataURL());

    if (undoStack.length > 30) {
        undoStack.shift();
    }

    redoStack = [];
}


// START WITH WHITE BACKGROUND
function initializeCanvas() {

    ctx.fillStyle = "white";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    saveHistory();
}

initializeCanvas();


// CHANGE TOOLS
function setTool(selectedTool) {

    tool = selectedTool;

    currentToolDisplay.textContent =
        selectedTool.charAt(0).toUpperCase()
        + selectedTool.slice(1);

    drawBtn.classList.remove("active");
    eraserBtn.classList.remove("active");
    textBtn.classList.remove("active");

    if (tool === "draw") {
        drawBtn.classList.add("active");
    }

    if (tool === "eraser") {
        eraserBtn.classList.add("active");
    }

    if (tool === "text") {
        textBtn.classList.add("active");
    }
}

setTool("draw");


// DRAW BUTTON
drawBtn.addEventListener("click", () => {

    shapeSelect.value = "";
    setTool("draw");

});


// ERASER BUTTON
eraserBtn.addEventListener("click", () => {

    shapeSelect.value = "";
    setTool("eraser");

});


// TEXT BUTTON
textBtn.addEventListener("click", () => {

    shapeSelect.value = "";
    setTool("text");

});

// SELECT / MOVE BUTTON
selectBtn.addEventListener("click", () => {
    tool = "select";
    currentToolDisplay.textContent = "Select / Move";
});
// SHAPE SELECTION
shapeSelect.addEventListener("change", () => {

    if (shapeSelect.value !== "") {

        setTool(shapeSelect.value);

    }

});


// GET MOUSE POSITION
function getPosition(event) {

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {

        x: (event.clientX - rect.left) * scaleX,

        y: (event.clientY - rect.top) * scaleY

    };
}


// MOUSE / POINTER DOWN
canvas.addEventListener("pointerdown", pointerDown);

function pointerDown(event) {

    event.preventDefault();

    const position = getPosition(event);

    startX = position.x;
    startY = position.y;
if (tool === "select") {

    if (
        selectionReady &&
        startX >= selectionX &&
        startX <= selectionX + selectionWidth &&
        startY >= selectionY &&
        startY <= selectionY + selectionHeight
    ) {
        movingSelection = true;

        dragOffsetX = startX - selectionX;
        dragOffsetY = startY - selectionY;

        ctx.clearRect(
            selectionX,
            selectionY,
            selectionWidth,
            selectionHeight
        );

        moveBackground = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

        return;
    }

    selectingArea = true;
    selectionReady = false;

    selectionStartX = startX;
    selectionStartY = startY;

    selectionBackground = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    return;
}

    // TEXT
    if (tool === "text") {

        const text = prompt("Enter your text:");

        if (text) {

            ctx.fillStyle = colorPicker.value;

            ctx.font = "24px Arial";

            ctx.fillText(
                text,
                startX,
                startY
            );

            saveHistory();
        }

        return;
    }


    drawing = true;


    // DRAW OR ERASE
    if (tool === "draw" || tool === "eraser") {

        ctx.beginPath();

        ctx.moveTo(
            startX,
            startY
        );

    }


    // SAVE IMAGE BEFORE DRAWING SHAPE
    if (
        tool === "rectangle" ||
        tool === "circle" ||
        tool === "line"
    ) {

        savedCanvasImage =
            ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
    }
}


// POINTER MOVE
canvas.addEventListener("pointermove", pointerMove);

function pointerMove(event) {
if (tool === "select" && selectingArea) {
    const position = getPosition(event);

    ctx.putImageData(selectionBackground, 0, 0);

    const x = Math.min(selectionStartX, position.x);
    const y = Math.min(selectionStartY, position.y);
    const width = Math.abs(position.x - selectionStartX);
    const height = Math.abs(position.y - selectionStartY);

    selectionX = x;
    selectionY = y;
    selectionWidth = width;
    selectionHeight = height;

    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    ctx.restore();

    return;
}
if (tool === "select" && movingSelection) {
    const position = getPosition(event);

    ctx.putImageData(moveBackground, 0, 0);

    selectionX = position.x - dragOffsetX;
    selectionY = position.y - dragOffsetY;

    ctx.putImageData(
        selectionImage,
        selectionX,
        selectionY
    );

    return;
}
if (tool === "select" && movingSelection) {
    const position = getPosition(event);

    ctx.putImageData(moveBackground, 0, 0);

    selectionX = position.x - dragOffsetX;
    selectionY = position.y - dragOffsetY;

    ctx.putImageData(
        selectionImage,
        selectionX,
        selectionY
    );

    return;
}
    if (!drawing) {
        return;
    }

    const position = getPosition(event);

    const currentX = position.x;
    const currentY = position.y;


    // FREEHAND DRAWING
    if (tool === "draw") {

        ctx.strokeStyle = colorPicker.value;

        ctx.lineWidth = 4;

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.lineTo(
            currentX,
            currentY
        );

        ctx.stroke();

        return;
    }


    // ERASER
    if (tool === "eraser") {

        ctx.strokeStyle = "white";

        ctx.lineWidth = 25;

        ctx.lineCap = "round";

        ctx.lineTo(
            currentX,
            currentY
        );

        ctx.stroke();

        return;
    }


    // RESTORE CANVAS WHILE PREVIEWING SHAPE
    if (savedCanvasImage) {

        ctx.putImageData(
            savedCanvasImage,
            0,
            0
        );

    }

    ctx.strokeStyle = colorPicker.value;

    ctx.lineWidth = 3;


    // RECTANGLE
    if (tool === "rectangle") {

        const width = currentX - startX;
        const height = currentY - startY;

        ctx.strokeRect(
            startX,
            startY,
            width,
            height
        );

    }


    // CIRCLE
    if (tool === "circle") {

        const radius = Math.sqrt(

            Math.pow(currentX - startX, 2)

            +

            Math.pow(currentY - startY, 2)

        );

        ctx.beginPath();

        ctx.arc(
            startX,
            startY,
            radius,
            0,
            Math.PI * 2
        );

        ctx.stroke();

    }


    // LINE
    if (tool === "line") {

        ctx.beginPath();

        ctx.moveTo(
            startX,
            startY
        );

        ctx.lineTo(
            currentX,
            currentY
        );

        ctx.stroke();

    }
}


// POINTER UP
canvas.addEventListener("pointerup", pointerUp);

canvas.addEventListener("pointerleave", pointerUp);

function pointerUp() {
if (tool === "select" && selectingArea) {
    selectingArea = false;

    ctx.putImageData(selectionBackground, 0, 0);

    if (selectionWidth > 5 && selectionHeight > 5) {
        selectionImage = ctx.getImageData(
            selectionX,
            selectionY,
            selectionWidth,
            selectionHeight
        );

        selectionReady = true;
    }

    return;
}
if (tool === "select" && movingSelection) {
    movingSelection = false;
    moveBackground = null;
    saveHistory();
    return;
}
    if (!drawing) {
        return;
    }

    drawing = false;

    ctx.closePath();

    savedCanvasImage = null;

    saveHistory();
}


// CLEAR BOARD
clearBtn.addEventListener("click", () => {

    const answer =
        confirm(
            "Are you sure you want to clear the entire board?"
        );

    if (!answer) {
        return;
    }

    ctx.fillStyle = "white";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    saveHistory();

});


// RESTORE IMAGE FOR UNDO / REDO
function restoreImage(imageData) {

    const image = new Image();

    image.onload = function () {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.drawImage(
            image,
            0,
            0
        );

    };

    image.src = imageData;
}


// UNDO
undoBtn.addEventListener("click", () => {

    if (undoStack.length <= 1) {
        return;
    }

    const currentState = undoStack.pop();

    redoStack.push(currentState);

    const previousState =
        undoStack[
            undoStack.length - 1
        ];

    restoreImage(previousState);

});


// REDO
redoBtn.addEventListener("click", () => {

    if (redoStack.length === 0) {
        return;
    }

    const nextState = redoStack.pop();

    undoStack.push(nextState);

    restoreImage(nextState);

});


// SAVE WHITEBOARD AS PNG
saveBtn.addEventListener("click", () => {

    const link =
        document.createElement("a");

    link.download =
        "MeTL-Whiteboard.png";

    link.href =
        canvas.toDataURL("image/png");

    link.click();

});

// ===============================
// AUTOMATIC SAVE AND RECOVERY
// ===============================

const AUTO_SAVE_KEY = "whiteboardAutoSave";

function autoSaveBoard() {
    const canvasData = canvas.toDataURL("image/png");
    localStorage.setItem(AUTO_SAVE_KEY, canvasData);
}

function recoverBoard() {
    const savedBoard = localStorage.getItem(AUTO_SAVE_KEY);

    if (!savedBoard) {
        return;
    }

    const img = new Image();

    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };

    img.src = savedBoard;
}

// Automatically save every 3 seconds
setInterval(autoSaveBoard, 3000);

// Save one last time if the page is closed or refreshed
window.addEventListener("beforeunload", autoSaveBoard);

// Recover the last automatically saved board
window.addEventListener("load", () => {
    setTimeout(recoverBoard, 500);
});
// ==============================
// IMAGE UPLOAD
// ==============================

imageBtn.addEventListener("click", () => {
    imageUpload.click();
});

imageUpload.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {

        const img = new Image();

        img.onload = function() {

            saveHistory();

            const maxWidth = 400;
            const maxHeight = 300;

            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = height * (maxWidth / width);
                width = maxWidth;
            }

            if (height > maxHeight) {
                width = width * (maxHeight / height);
                height = maxHeight;
            }

            const x = (canvas.width - width) / 2;
            const y = (canvas.height - height) / 2;

            ctx.drawImage(img, x, y, width, height);
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);

    imageUpload.value = "";
});