// 🔥 Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAnBQsZQd1hgZw8Vxzu-tdjHzKE2cxQShs",
    authDomain: "bitchcup.firebaseapp.com",
    projectId: "bitchcup",
    storageBucket: "bitchcup.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "bitchcup"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

const apiURL = "https://us-central1-bitchcup.cloudfunctions.net/api"; // Your Firebase Functions URL

// 📌 Submit Post to Firebase API
document.getElementById("postForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = document.getElementById("imageInput").files[0];
    const username = document.getElementById("username").value;
    const caption = document.getElementById("caption").value;

    if (!file || !username || !caption) {
        alert("Please fill all fields and select an image.");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("username", username);
    formData.append("caption", caption);

    const response = await fetch(`${apiURL}/addPost`, {
        method: "POST",
        body: formData,
    });

    if (response.ok) {
        alert("Post uploaded!");
        loadFeed();  // Refresh feed after posting
    } else {
        alert("Failed to upload post");
    }
});

// 📌 Fetch and Display Posts from Firebase API
async function loadFeed() {
    const feedDiv = document.getElementById("feed");
    feedDiv.innerHTML = "";

    const response = await fetch(`${apiURL}/posts`);
    const posts = await response.json();

    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.innerHTML = `
            <h3>${post.username}</h3>
            <p>${post.caption}</p>
            <img src="${post.imageUrl}" style="max-width: 100%;" />
            <hr>
        `;
        feedDiv.appendChild(postElement);
    });
}

loadFeed(); // Load posts on page load
