const players = ["Alice", "Bob", "Charlie", "David", "Eve"];

function populateDropdown(id, data) {
    const dropdown = document.getElementById(id);
    dropdown.innerHTML = '<option value="">Select</option>'; // Reset options
    data.forEach(player => {
        const option = document.createElement("option");
        option.value = player;
        option.textContent = player;
        dropdown.appendChild(option);
    });
}

// Populate partner and opponents dynamically
window.onload = function () {
    populateDropdown("partner", players);
    populateDropdown("opponent1", players);
    populateDropdown("opponent2", players);
};

let videoStream = null;

// Enable Camera
document.getElementById("startCamera").addEventListener("click", function () {
    const video = document.getElementById("video");
    const captureButton = document.getElementById("capturePhoto");

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.style.display = "block";
            captureButton.style.display = "block";
            video.srcObject = stream;
            videoStream = stream;
        })
        .catch(err => console.log("Error accessing camera: ", err));
});

// Capture Photo and Turn Off Camera
document.getElementById("capturePhoto").addEventListener("click", function () {
    const video = document.getElementById("video");
    const photo = document.getElementById("photo");
    const canvas = document.createElement("canvas");

    // Capture frame from video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    // Set captured image as src
    photo.src = canvas.toDataURL("image/png");
    photo.style.display = "block";

    // Stop the video stream
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }

    // Hide video & buttons after capture
    video.style.display = "none";
    this.style.display = "none";
});

// Upload Photo from Camera Roll
document.getElementById("uploadPhoto").addEventListener("change", function (event) {
    const photo = document.getElementById("photo");
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            photo.src = e.target.result;
            photo.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
});

function goBack(){
    window.history.back();
}