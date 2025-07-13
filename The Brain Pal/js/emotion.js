// const video = document.getElementById("video");
// const output = document.getElementById("emotion-output");

// // Load face-api models from correct folder
// Promise.all([
//   faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
//   faceapi.nets.faceExpressionNet.loadFromUri('/models')
// ]).then(startVideo);

// function startVideo() {
//   navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
//     .then((stream) => {
//       console.log("✅ Webcam stream started");
//       video.srcObject = stream;

//       video.onloadedmetadata = () => {
//         video.play().then(() => {
//           console.log("▶️ Video playing on screen");
//         }).catch(err => {
//           console.error("❌ Video play error:", err);
//         });
//       };
//     })
//     .catch((err) => {
//       console.error("❌ Webcam access error:", err);
//     });
// }

// video.onplaying = () => {
//   console.log("🎥 Video is now visually rendering");

//   const canvas = faceapi.createCanvasFromMedia(video);
//   document.body.append(canvas);

//   const displaySize = {
//     width: video.videoWidth,
//     height: video.videoHeight
//   };

//   faceapi.matchDimensions(canvas, displaySize);

//   setInterval(async () => {
//     const detections = await faceapi
//       .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
//       .withFaceExpressions();

//     const context = canvas.getContext("2d");
//     context.clearRect(0, 0, canvas.width, canvas.height);

//     const resized = faceapi.resizeResults(detections, displaySize);
//     faceapi.draw.drawDetections(canvas, resized);

//     if (detections.length > 0) {
//       const expressions = detections[0].expressions;
//       const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
//       const [topEmotion, confidence] = sorted[0];
//       output.textContent = `😃 Emotion: ${topEmotion} (${(confidence * 100).toFixed(1)}%)`;
//     } else {
//       output.textContent = "⚠️ No face detected.";
//     }
//   }, 500);
// };




const video = document.getElementById('video');
const output = document.getElementById('emotion-output');

// Load models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    .then(stream => {
      video.srcObject = stream;
      video.onloadedmetadata = () => video.play();
    })
    .catch(err => console.error('❌ Webcam access error:', err));
}

video.onplaying = () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  const displaySize = {
    width: video.videoWidth,
    height: video.videoHeight,
  };

  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    const resized = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resized);

    if (detections.length > 0) {
      const [emotion, confidence] = Object.entries(detections[0].expressions)
        .sort((a, b) => b[1] - a[1])[0];
      output.textContent = `😃 ${emotion} (${(confidence * 100).toFixed(1)}%)`;
    } else {
      output.textContent = '⚠️ No face detected.';
    }
  }, 300);
};

