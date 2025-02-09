document.addEventListener("DOMContentLoaded", async () => {
    const feedDiv = document.getElementById("feed");

    async function loadFeed() {
        feedDiv.innerHTML = "<p>Loading feed...</p>"; // Show loading message

        try {
            console.log("🔄 Fetching feed data...");
            const response = await fetch("/api/feed");

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const posts = await response.json();
            console.log("✅ Fetched posts:", posts); // Debugging step

            feedDiv.innerHTML = ""; // Clear loading message

            if (!posts.length) {
                feedDiv.innerHTML = "<p>No games have been played yet.</p>";
                return;
            }

            posts.forEach(post => {
                const postElement = document.createElement("div");
                postElement.classList.add("feed-post");

                postElement.innerHTML = `
                    <h3>${post.playerName} played ${post.gameType}</h3>
                    <p><strong>Match:</strong> ${post.partner ? `${post.partner} & ${post.playerName}` : post.playerName} 
                    vs. ${post.opponent1} ${post.opponent2 ? "& " + post.opponent2 : ""}</p>
                    <p><strong>Winner:</strong> ${post.result}</p>
                    ${post.image ? `<img src="${post.image}" alt="Game Image" class="feed-image">` : ""}
                    <p class="timestamp">${new Date(post.timestamp).toLocaleString()}</p>
                `;

                feedDiv.appendChild(postElement);
            });
        } catch (error) {
            console.error("❌ Error fetching feed:", error);
            feedDiv.innerHTML = "<p>Error loading feed. Check console for details.</p>";
        }
    }

    loadFeed(); // Load posts on page load
});
