const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
var session = require("express-session");
const fs = require('fs').promises;
const path = require('path');
var uuidv4 = require('uuid').v4;
var pug = require('pug');

//////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
app.use(session({
    secret: 'sample-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

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

//Register Page
app.post("/api/registertest", async function (req, res) {
    const { name, surname, email, password, confirmPassword, isLoggedIn } = req.body;

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
        uuid: uuidv4(),
        name: name,
        surname: surname,
        email: email,
        password: hashedPassword,
        isLoggedIn: false,
    };

    userDatabase.push(newUser);
    await writeUserDB(userDatabase);
    return res.redirect('/');
});

//Login Page
app.post("/api/logintest", async function (req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.send('Please fill in each part.');
    }

    const userDatabase = await readUserDB();
    const user = userDatabase.find(user => user.email === email);

    if (!user) {
        return res.send("No user found with this email.");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.send("Wrong password.");
    }

    req.session.user = {
        uuid: user.uuid,
        name: user.name,
        surname: user.surname,
        email: user.email,
        isLoggedIn: true
    }
    req.session.save()

    const userIndex = userDatabase.findIndex(u => u.email === email);
    console.log(userIndex);
    userDatabase[userIndex].isLoggedIn = true;
    await writeUserDB(userDatabase);

    return res.redirect('/');
});

//Logout Function
app.post("/api/logouttest", async function (req, res) {
    if (req.session.user) {
        let userDatabase = await readUserDB();
        const userIndex = userDatabase.findIndex(user => user.uuid === req.session.user.uuid);
        if (userIndex !== -1) {
            userDatabase[userIndex].isLoggedIn = false;
            await writeUserDB(userDatabase); 
        }
        req.session.destroy();
    }
    res.redirect("/");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});