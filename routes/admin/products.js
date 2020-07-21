//external modules
const express = require('express');
const multer = require('multer');

// internal modules
const {requireTitle, requirePrice} = require('./validator');
const productsRepo = require('../../repositories/products');
const newProductTemplate = require('../../views/admin/products/new');
const listProductsTemplate = require('../../views/admin/products/index');
const productEditTemplate = require('../../views/admin/products/edit');
const {handleErrors, requireAuth} = require('./middlewares');
const products = require('../../repositories/products');


const router = express.Router();
const upload = multer({storage: multer.memoryStorage()});

//route to show form to create products
router.get('/admin/products/new', requireAuth, (req, res) => {
    res.send(newProductTemplate({}));
});

//submit to create new product
router.post('/admin/products/new',
    requireAuth,
    upload.single('image'),
    [requirePrice, requireTitle],
    handleErrors(newProductTemplate),
    async (req, res) => {
        const imgStr = req.file.buffer.toString('base64');
        const {title, price} = req.body;
        await productsRepo.create({title, price, imgStr})

        res.redirect('/admin/products')
});

//route to list all products
router.get('/admin/products', 
    requireAuth,
    async (req, res) => { 
        const products = await productsRepo.getAll();
        res.send(listProductsTemplate({products}))
    }  
);

//editing products

//submitting the edit form

//deleting products

router.get('/admin/products/:id/edit', 
    requireAuth, 
    async (req, res) => {
        const product = await productsRepo.getOne(req.params.id);

        if(!product) {
            return res.send('Product not found')
        }

        res.send(productEditTemplate({product}))
});

router.post('/admin/products/:id/edit', requireAuth, 
    async (req, res) => {
        
    }
)

module.exports = router;