

async function fetchPlayers() {
try {
    console.log("Fetching Now...");
    const response = await fetch("/api/players");  // API call to backend
    
    if(!response.ok){
        throw new Error("HTTP Error! Status: " + response.status);
    }

    const players = await response.json();
    console.log("Fetched Players:", players);

    return Array.isArray(players) ? players : [];

} catch (err) {
    console.error("Error fetching players:", err);
    return [];
}
}
    

function populateDropdown(id, data) {

    if(!Array.isArray(data)){
        console.error("No array for ${id}, got", data);
    }

    const dropdown = document.getElementById(id);
    dropdown.innerHTML = '<option value="">Select</option>'; // Reset options
    data.forEach(player => {
        const option = document.createElement("option");
        option.value = player.email;
        option.textContent = player.name;
        dropdown.appendChild(option);
    });
    $(`#${id}`).select2();
}

// Populate partner and opponents dynamically
window.onload = async function () {
    console.log("Window loaded, fetch players");
    const players = await fetchPlayers();
    console.log("Fetch players for dropdown:", players);

    if (!players || players.length === 0){
        console.error("No Players");
        return;
    }

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
document.getElementById("gameForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("User ID not found. Please log in again.");
        return;
    }
    formData.append("userId", userId);

    try {
        console.log("🔄 Submitting game data...");
        const response = await fetch("/formFillUp", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log("✅ Server response:", data);

        if (data.redirect) {
            console.log("🔀 Redirecting to:", data.redirect);
            window.location.href = data.redirect; // Redirect to feedpage.html
        } else {
            alert("Game recorded, but no redirect URL received.");
        }
    } catch (error) {
        console.error("❌ Error submitting game:", error);
        alert("Error submitting game. Check console.");
    }
});
