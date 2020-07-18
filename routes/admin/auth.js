const express = require('express');
const {check, validationResult} = require('express-validator')
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup')
const signinTemplate = require('../../views/admin/auth/signin')


const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signupTemplate({req}))
});

router.post('/signup', 
    [
        //sanitize and validate input
        check('email')
            .trim()
            .normalizeEmail()
            .isEmail()
            .custom(async (email)=> {
                // Check for existing email
                const existingUser = await usersRepo.getOneBy({email})
                if (existingUser) {
                    throw new Error("Email already in use");
                }
            }),
        check('password')
            .trim()
            .isLength({min: 4, max: 20})
            .withMessage('Must be between 4 and 20 characters'),
        check('confirmation')
            .trim()
            .isLength({min:4, max:20})
            .withMessage('Must be between 4 and 20 characters')
            .custom(async(confirmation, { req }) => {
                if (confirmation !== req.body.password) {
                    throw new Error('Passwords must match')
                }
            })
    ], 
    async (req, res) => {
        //capture any errors in a varaible 
        const errors = validationResult(req)
        console.log(errors)
        
        const {email, password, confirmation} = req.body;

        // Create a user in our user repo to represent this person
        console.log("Creating user account")
        const user = await usersRepo.create({email, password});

        // Store their id with the cookie
        req.session.userId = user.id;

        res.send("Account Created!")
    });

router.get('/signout', (req, res) => {
    req.session = null;
    res.send("You are now signed out")
});

router.get('/signin', (req, res) => {
    res.send(signinTemplate())
});

router.post('/signin', async (req, res) => {
    const {email, password} = req.body;

    const user = await usersRepo.getOneBy({email})

    if (!user) {
        return res.send('email not found!')
    }

    if (!await usersRepo.comparePasswords(user.password, password)) {
        return res.send('Invalid Password')
    }

    req.session.userId = user.id;
    res.send('Successfully logged in!')
});

module.exports = router;