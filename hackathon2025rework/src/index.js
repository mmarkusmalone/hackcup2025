require('dotenv').config();

const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const uri = process.env.MONGODB_URI;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
const port = 3000;
const app = express();

const cors = require('cors');
app.use(cors({ origin: '*' }));

const client = new MongoClient(uri, clientOptions);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// For serving static HTML files
app.use(express.static(path.join(__dirname, '../public')));

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": "*",
    });

    return res.redirect("index.html");
});

app.get("/firebase-config", (req, res) => {
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    };
    res.json(firebaseConfig);
});

// API endpoint to fetch players
app.get("/api/players", async (req, res) => {

    console.log("Request received for /api/players");

    try {
        await client.connect();
        const database = client.db("bitchCup");
        const collection = database.collection("users");

        console.log("Attempting to fetch players...");

        // Fetch all posts, sorted by the latest game
        const people = await collection.find().toArray();

        console.log("Fetched players: ", people); // Log the fetched data

        res.json(people);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch feed data" });
    } finally {
        await client.close();
    }
});

app.post("/formFillUp", async (req, res) => {
    const { userId, gameType, partner, opponent1, opponent2, result, image } = req.body;
    console.log("🔍 Received game submission for userId:", userId);
    const gameData = {
        gameId: uuidv4(),
        gameType,
        partner,
        opponent1,
        opponent2,
        result,
        image,
        timestamp: new Date(),
    };

    try {
        await client.connect();
        const database = client.db("bitchCup");
        const usersCollection = database.collection("users");

        // Find user and update their games array
        const updateResult = await usersCollection.updateOne(
            { userId: userId },
            { $push: { games: gameData } }
        );

        if (updateResult.modifiedCount === 0) {
            console.error("❌ User not found in database:", userId);
            return res.status(404).json({ error: "User not found" });
        }

        console.log("✅ Game inserted successfully for userId:", userId);
        res.status(201).json({ message: "Game recorded successfully", redirect: "/feedpage.html" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to record game" });
    } finally {
        await client.close();
    }
});


app.get("/api/feed", async (req, res) => {
    try {
        await client.connect();
        const database = client.db("bitchCup");
        const usersCollection = database.collection("users");

        // Fetch all users and include userId, name, and their games
        const users = await usersCollection.find({}, { projection: { userId: 1, name: 1, games: 1, _id: 0 } }).toArray();

        // Transform data: include player name inside each game
        let allGames = users.flatMap(user =>
            (user.games || []).map(game => ({
                ...game,
                playerName: user.name, // Attach player name
                userId: user.userId,   // Keep userId for potential linking
            }))
        );

        // Sort games by timestamp (most recent first)
        allGames.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(allGames);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch feed data" });
    } finally {
        await client.close();
    }
});



async function run() {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});