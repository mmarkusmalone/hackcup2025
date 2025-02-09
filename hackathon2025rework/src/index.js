const express = require("express");
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const uri = "mongodb+srv://mcm151:KtG29jf4WhiAxfLK@bitchcup.0jhqe.mongodb.net/?retryWrites=true&w=majority&appName=bitchCup";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
const port = 3000;
const app = express();

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

app.post("/formFillUp", async (req, res) => {
    const { gameType, partner, opponent1, opponent2, result, image } = req.body;

    const data = {
        gameType,
        partner,
        opponent1,
        opponent2,
        result,
        image,
    };

    try {
        await client.connect();
        const database = client.db("bitchCup"); // Replace with your database name
        const collection = database.collection("games");
        await collection.insertOne(data);
        console.log("Data inserted successfully!");
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }

    console.log("Form submitted!");
    return res.redirect("feedpage.html");
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