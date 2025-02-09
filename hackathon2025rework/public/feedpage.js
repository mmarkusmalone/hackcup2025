document.addEventListener("DOMContentLoaded", async () => {
    const feedDiv = document.getElementById("feed");

    async function loadFeed() {
        feedDiv.innerHTML = ""; // Clear previous posts

        try {
            const response = await fetch("/api/feed"); // Fetch data from MongoDB
            const posts = await response.json();

            posts.forEach(post => {
                const postElement = document.createElement("div");
                postElement.classList.add("feed-post");

                postElement.innerHTML = `
                    <h3>${post.partner} & ${post.opponent1} vs. ${post.opponent2} & ${post.gameType}</h3>
                    <p><strong>Winner:</strong> ${post.result}</p>
                    ${post.image ? `<img src="${post.image}" alt="Game Image" class="feed-image">` : ""}
                `;

                feedDiv.appendChild(postElement);
            });
        } catch (error) {
            console.error("Error fetching feed:", error);
        }
    }

    loadFeed(); // Load posts on page load
});
