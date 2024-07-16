// importing styles
import "./styles/global.scss";

// imports
import * as tf from "@tensorflow/tfjs";

tf.ready();

const canvas = document.getElementById("drawing-canvas");
const ctx = canvas.getContext("2d");

// setting the canvas size (it has a fixed size)
canvas.width = 300;
canvas.height = 300;

// buttons
const clearBtn = document.getElementById("clear-btn");
const predictBtn = document.getElementById("predict-btn");

const predictionContainer = document.getElementById("pred-container");

// model used to predict the digits
let model;
// loading it only once
async function loadModel() {
    if (!model) {
        model = await tf.loadLayersModel("./model.json");
    }
}

// setting up defaults
let isDrawing = false;
resetCanvas();

// drawing logic
canvas.addEventListener("mousedown", () => {
    isDrawing = true;
});
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    ctx.beginPath();
});
canvas.addEventListener("mouseleave", () => {
    isDrawing = false;
    ctx.beginPath();
});
canvas.addEventListener("mouseenter", (event) => {
    if (event.buttons === 1) {
        // If the left mouse button is held down
        isDrawing = true;
    }
});
canvas.addEventListener("mousemove", draw);
clearBtn.addEventListener("click", resetCanvas);
predictBtn.addEventListener("click", predictDigit);

function draw(event) {
    if (!isDrawing) return;
    ctx.lineWidth = 21;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";

    ctx.lineTo(
        event.clientX - canvas.offsetLeft,
        event.clientY - canvas.offsetTop
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
        event.clientX - canvas.offsetLeft,
        event.clientY - canvas.offsetTop
    );
}

function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPredPlaceholder();
}

// predicting the digit
async function predictDigit() {
    try {
        await loadModel();

        const img = tf.browser
            .fromPixels(canvas)
            .resizeNearestNeighbor([28, 28])
            .mean(2)
            .toFloat()
            .expandDims(0)
            .expandDims(-1)
            .div(255);

        const preds = model.predict(img);
        const predsArray = await preds.array(); // Convert to a standard array

        // getting the digit with the max probability
        const predictedDigit = predsArray[0].reduce(
            (iMax, current, i, arr) => (current > arr[iMax] ? i : iMax),
            0
        );

        setPredictedDigit(predictedDigit.toString());
    } catch (e) {
        console.error(e);
    }
}

function setPredPlaceholder() {
    predictionContainer.textContent = "";
    const newElement = document.createElement("img");
    newElement.src = "./assets/sparkles.png";
    newElement.alt = "Sparkles";
    newElement.classList.add("pred-placeholder-img");
    predictionContainer.appendChild(newElement);
}

function setPredictedDigit(digit) {
    predictionContainer.textContent = "";
    const newElement = document.createElement("h2");
    newElement.textContent = digit;
    newElement.classList.add("predicted-digit");
    predictionContainer.appendChild(newElement);
}
