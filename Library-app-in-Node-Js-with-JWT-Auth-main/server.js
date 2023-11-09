const express = require('express');
const app = express()
const jwt = require("jsonwebtoken")
require('dotenv').config();

app.use(express.json())
const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGODB_URI;
const tokenBlacklist = [];

app.post('/login', async (req, res) => {
    var bodyData = req.body;
    const client = await MongoClient.connect(uri);
    const dbName = "library";
    const collectionName = "users";
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    try {
        var adminCred = await collection.find({ username: bodyData.username, password: bodyData.password }).toArray();
        if (adminCred.length > 0) {
            const accesstoken = jwt.sign({ id: adminCred[0].id, creator: adminCred[0].creator, viewer: adminCred[0].viewer, viewall: adminCred[0].viewall }, "mySecretKey", {
                expiresIn: "1h",
            })
            res.json(accesstoken)
        }
        else {
            console.log("Not a Verified User");
            res.status(401).json({ Error: 'Unable to Login : Invalid Username or Password' })
        }
    }
    catch (err) {
        res.status(500).json({ Error: 'An error occured! Unable to login !' })
    }
    client.close()
})

const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        if (tokenBlacklist.includes(token)) {
            return res.status(401).json('Token has been invalidated. Please log in again.');
        }

        jwt.verify(token, "mySecretKey", (err, user) => {
            if (err) {
                return res.status(403).json("Token is not valid!");
            }

            req.user = user;
            next();
        });
    } else {
        res.status(401).json("You are not authenticated!");
    }
};

app.get("/books", verify, async (req, res) => {
    const client = await MongoClient.connect(uri);
    const dbName = "library";
    const collectionName = "books";
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    let bookByUser = [];
    let allBooks = [];
    try {
        console.log(req.user.viewer)
        if (req.user.viewer) {
            if (req.query.old === '1') {
                const tenMinutesAgo = new Date();
                tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
                bookByUser = await collection.find({
                    ownerid: req.user.id,
                    createdAt: { $lte: tenMinutesAgo }
                }).toArray();
            }
            else if (req.query.new === '1') {
                const tenMinutesAgo = new Date();
                tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
                bookByUser = await collection.find({
                    ownerid: req.user.id,
                    createdAt: { $gte: tenMinutesAgo }
                }).toArray();
            }
            else {
                bookByUser = await collection.find({ ownerid: req.user.id }).toArray();
            }
        }
        if (req.user.viewall) {
            if (req.query.old === '1') {
                const tenMinutesAgo = new Date();
                tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
                allBooks = await collection.find({
                    createdAt: { $lte: tenMinutesAgo }
                }).toArray();
            }
            else if (req.query.new === '1') {
                const tenMinutesAgo = new Date();
                tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);
                allBooks = await collection.find({
                    createdAt: { $gte: tenMinutesAgo }
                }).toArray();
            }
            else {
                allBooks = await collection.find().toArray();
            }
        }

        if (bookByUser.length > 0 || allBooks.length > 0) {
            res.status(200).json({ bookByUser, allBooks });
        } else {
            res.status(404).json({ Error: 'No books found for the user.' });
        }
    } catch (err) {
        res.status(500).json({ Error: 'An error occurred while fetching books.' });
    } finally {
        client.close();
    }
});


app.post("/books", verify, async (req, res) => {
    const client = await MongoClient.connect(uri);
    const dbName = "library";
    const collectionName = "books";
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    reqBody = req.body
    try {
        if (req.user.creator) {
            const currentTime = new Date();
            newBook = await collection.insertOne({ bookname: reqBody.bookname, ownerid: req.user.id, createdAt: currentTime });
            res.status(200).json("Successfully inserted new book");
        } else {
            res.status(403).json({ Error: 'Does not have permission to add new book' });
        }
    } catch (err) {
        res.status(500).json({ Error: 'An error occurred while adding book.' });
    } finally {
        client.close();
    }
});

app.get('/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        tokenBlacklist.push(token);
        res.status(200).json('Successfully logged out');
    } else {
        res.status(401).json('Invalid token');
    }
});

app.listen('5000', () => {
    console.log("Server started to listen on the port ");
})