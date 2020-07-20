const express = require('express');
const {check, validationResult} = require('express-validator')
const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup')
const signinTemplate = require('../../views/admin/auth/signin')
const {
    checkEmail, 
    checkPassword, 
    checkConfirmation,
    checkEmailSignIn,
    checkPassSignIn
} = require('./validator') 


const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signupTemplate({req}))
});

router.post('/signup', 
    [checkEmail, checkPassword, checkConfirmation], 
    async (req, res) => {
        const errors = validationResult(req)
        
        if (!errors.isEmpty()) res.send(signupTemplate({req, errors}))
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
    res.send(signinTemplate({}))
});

router.post('/signin', [checkEmailSignIn, checkPassSignIn],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.send(signinTemplate({errors}))
        } 
        console.log(errors)
        const {email} = req.body;

    const user = await usersRepo.getOneBy({email})

    req.session.userId = user.id;
    res.send('Successfully logged in!')
});

module.exports = router;