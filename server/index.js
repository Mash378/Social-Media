const express = require("express")
const mongoose = require('mongoose')
const cors = require("cors")
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const UserModel = require('./models/User')

const app = express()
app.use(express.json())
app.use(cors())

// Create connection with MongoDB

mongoose.connect("mongodb+srv://jacobbowler:E1Sl11nNikTC6mgy@reelrivals.jiax1.mongodb.net/users_db");

app.post("/login", async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await UserModel.findOne({username: username})
        if (!user) {
            return res.status(400).json("No record existed.")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid)
        {
            return res.status(401).json("Password is incorrect.")
        }

        res.json("Success!")
    }
    catch(err) {
        res.status(500).json({ error: "Error logging in."})
    }
})

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body
    try {
        const existingUser = await UserModel.findOne({ username })
        const existingEmail = await UserModel.findOne({ email })
        if (existingUser || existingEmail) {
            return res.status(400).json({ error: "User with this email or username already exists." })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await UserModel.create({ username, email, password: hashedPassword })
        res.json(newUser)
    } catch (err) {
        res.status(500).json({ error: "Error registering user." })
    }
})

app.listen(3001, () => {
    console.log("Server is running")
})