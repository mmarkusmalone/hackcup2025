// 3️⃣ Get Overall Leaderboard (Sorted by Points)
app.get("/leaderboard", async (req, res) => {
    try {
        const players = await Player.find().sort({ points: -1 });
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
});

// 4️⃣ Get Leaderboard by Game
app.get("/leaderboard/game/:game", async (req, res) => {
    try {
        const game = req.params.game;
        const players = await Player.find({ game }).sort({ points: -1 });
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch game leaderboard" });
    }
});

// 5️⃣ Get Leaderboard by Community
app.get("/leaderboard/community/:community", async (req, res) => {
    try {
        const community = req.params.community;
        const players = await Player.find({ community }).sort({ points: -1 });
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch community leaderboard" });
    }
});

// 6️⃣ Get Leaderboard by Both Game and Community
app.get("/leaderboard/:community/:game", async (req, res) => {
    try {
        const { community, game } = req.params;
        const players = await Player.find({ community, game }).sort({ points: -1 });
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch filtered leaderboard" });
    }
});