const express = require('express');

const {handleErrors} = require('./middlewares')
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
    handleErrors(signupTemplate),
    async (req, res) => {        
        const {email, password} = req.body;

        // Create a user in our user repo to represent this person
        const user = await usersRepo.create({email, password});

        // Store their id with the cookie
        req.session.userId = user.id;

        res.redirect("/admin/products")
    });

router.get('/signout', (req, res) => {
    req.session = null;
    res.send("You are now signed out")
});

router.get('/signin', (req, res) => {
    res.send(signinTemplate({}))
});

router.post('/signin', 
    [checkEmailSignIn, checkPassSignIn],
    handleErrors(signinTemplate),
    async (req, res) => {
        const {email} = req.body;
        const user = await usersRepo.getOneBy({email})
        req.session.userId = user.id;
        res.redirect('/admin/products')
    }
);

module.exports = router;