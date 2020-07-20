const express = require('express');
const productsRepo = require('../../repositories/products');
const newProductTemplate = require('../../views/admin/products/new');
const {requireTitle, requirePrice} = require('./validator');
const {validationResult} = require('express-validator');

const router = express.Router();

//route to list all products
router.get('/admin/products', (req, res) => { 

});

//route to show form to create products
router.get('/admin/products/new',(req, res) => {
    res.send(newProductTemplate({}));
});

//submit the form
router.post('/admin/products/new',[requirePrice, requireTitle], 
    (req, res) => {
        errors = validationResult(req)

        req.on('data', data => {
            console.log('sending form data')
        })
        console.log(req.body)
        res.send('Submitted new product')
});


//editing products

//submitting the edit form

//deleting products

module.exports = router;