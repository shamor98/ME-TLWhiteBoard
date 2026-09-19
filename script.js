const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");

const drawBtn = document.getElementById("drawBtn");
const eraserBtn = document.getElementById("eraserBtn");
const textBtn = document.getElementById("textBtn");
const clearBtn = document.getElementById("clearBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const saveBtn = document.getElementById("saveBtn");
const colorPicker = document.getElementById("colorPicker");
const shapeSelect = document.getElementById("shapeSelect");
const currentToolDisplay = document.getElementById("currentTool");

let tool = "draw";
let drawing = false;

let startX = 0;
let startY = 0;

let savedCanvasImage = null;

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