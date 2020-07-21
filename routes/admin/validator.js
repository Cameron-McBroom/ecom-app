const {check} = require('express-validator')
const usersRepo = require('../../repositories/users')

module.exports = {
    checkEmail: check('email')
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
    
    checkPassword: check('password')
    .trim()
    .isLength({min: 4, max: 20})
    .withMessage('Must be between 4 and 20 characters'),
    
    checkConfirmation: check('confirmation')
    .trim()
    .isLength({min:4, max:20})
    .withMessage('Must be between 4 and 20 characters')
    .custom(async(confirmation, { req }) => {
        if (confirmation !== req.body.password) {
            throw new Error('Passwords must match')
        }
    }),
    
    checkEmailSignIn: check('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Must provide valid email')
    .custom(async(email) => {
        const user = await usersRepo.getOneBy({email})
        if (!user) {
            throw new Error('Email not found')
        }
    }),

    checkPassSignIn: check('password')
    .trim()
    .custom(async (password, {req}) => {
        const user = await usersRepo.getOneBy({email:req.body.email})
        if (!user) throw new Error('Invalid password')

        if (!await usersRepo.comparePasswords(user.password, password)) {
            throw new Error('Invalid Password')
        }
    }),

    requireTitle: check('title')
    .trim()
    .isLength({min:5, max: 40})
    .withMessage('Title must between 5 & 40 characters'),

    requirePrice: check('price')
    .trim()
    .toFloat()
    .isFloat({min: 1})
    .withMessage('Must be a number greater than 1')
    
}