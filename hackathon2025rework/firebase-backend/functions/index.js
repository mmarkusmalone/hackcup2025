const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const multer = require("multer");
const path = require("path");
const os = require("os");
const fs = require("fs");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage().bucket(); // Connect to Firebase Storage

const app = express();
app.use(cors());
app.use(express.json());

// Multer configuration for handling image uploads
const upload = multer({dest: os.tmpdir()});

//  Add a Post (Upload Image + Save to Firestore)
app.post("/addPost", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No image uploaded"});
    }

    const {username, caption} = req.body;
    const filePath = req.file.path;
    const fileName = `${Date.now()}_${path.basename(
        req.file.originalname)}`;
    const fileUpload = storage.file(`images/${fileName}`);

    // Upload image to Firebase Storage
    await fileUpload.save(fs.readFileSync(filePath), {
      metadata: {contentType: req.file.mimetype},
    });

    // Get the image's public URL
    const imageUrl = `https://storage.googleapis.com/${storage.name}/images/${fileName}`;

    // Save post data in Firestore
    const newPost = {
      username,
      caption,
      imageUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("posts").add(newPost);

    fs.unlinkSync(filePath); // Remove temp file
    res.json({message: "Post added successfully!", newPost});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Failed to upload post"});
  }
});

//  Get All Posts (Retrieve from Firestore)
app.get("/posts", async (req, res) => {
  try {
    const snapshot = await db.collection("posts").orderBy(
        "timestamp", "desc").get();
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id, ...doc.data()}));
    res.json(posts);
  } catch (error) {
    res.status(500).json({error: "Failed to fetch posts"});
  }
});

// Deploy as Firebase Function
exports.api = functions.https.onRequest(app);


// 3️Leaderboard (Sort Players by Points)
app.get("/leaderboard", async (req, res) => {
  try {
    const snapshot = await db.collection("players").orderBy("points",
        "desc").get();
    const players = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
    res.json(players);
  } catch (error) {
    res.status(500).json({error: "Failed to fetch leaderboard"});
  }
});

// 4️ Add a Player (For Leaderboard)
app.post("/addPlayer", async (req, res) => {
  try {
    const {name, community, game, points} = req.body;

    const newPlayer = {name, community, game, points};
    await db.collection("players").add(newPlayer);

    res.json({message: "Player added successfully!"});
  } catch (error) {
    res.status(500).json({error: "Failed to add player"});
  }
});

// 5️ Update Player's Points
app.put("/updatePoints/:id", async (req, res) => {
  try {
    const {points} = req.body;
    const playerRef = db.collection("players").doc(req.params.id);

    await playerRef.update({points:
        admin.firestore.FieldValue.increment(points)});

    res.json({message: "Player points updated!"});
  } catch (error) {
    res.status(500).json({error: "Failed to update points"});
  }
});

// Deploy Express API as Firebase Function
exports.api = functions.https.onRequest(app);
