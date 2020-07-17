const express = require('express')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const usersRepo = require('./repositories/users')

const app = express();
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieSession({keys: ['a9dsgaf897mfg70s7']}))

app.get('/', (req, res) => {
    res.send(`
        <div>
            Your id is: ${req.session.userId}
            <form method="POST">
                <input name="email" placeholder="email" />
                <input name="password" placeholder="password" />
                <input name="confirmation" placeholder="password confirmation" />
                <button>Sign Up</button>
            </form>
        </div>
    `)
});

app.post('/', async (req, res) => {
    const {email, password, confirmation} = req.body;

    // Check for existing email
    const existingUser = await usersRepo.getOneBy({email})
    if (existingUser) {
        return res.send("Email already in use")
    }

    // Check passwords match
    if (password !== confirmation) {
        return res.send("Passwords must match")
    }

    // Create a user in our user repo to represent this person
    console.log("Creating user account")
    const user = await usersRepo.create({email, password});

    // Store their id with the cookie
    req.session.userId = user.id;

    res.send("Account Created!")
});

app.listen(3000, () => {
    console.log('Listening')
});

// This is a test line of codes