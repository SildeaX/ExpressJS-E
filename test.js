const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
var session = require("express-session");
const fs = require('fs').promises;
const path = require('path');

app.use(express.static("html"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "html", "maintest.html"));
});

async function readUserDB() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'userDB.json'), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

async function writeUserDB(data) {
    await fs.writeFile(path.join(__dirname, 'userDB.json'), JSON.stringify(data, null, 2), 'utf8');
}

app.post("/api/registertest", async function (req, res) {
    const { name, surname, email, password, confirmPassword } = req.body;

    if (!name || !surname || !email || !password || !confirmPassword) {
        return res.send('Please fill in each part.');
    }

    else if (password !== confirmPassword) {
        return res.send("Passwords didn't match.");
    }

    let userDatabase = await readUserDB();

    if (userDatabase.some(user => user.email === email)) {
        return res.send("This email is already registered.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        name: name,
        surname: surname,
        email: email,
        password: hashedPassword,
    };

    userDatabase.push(newUser);
    await writeUserDB(userDatabase);
    return res.redirect('/');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});