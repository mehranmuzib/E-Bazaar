const { Seller } = require('../models/seller');
const express = require('express');
const { Category } = require('../models/category');
const { User } = require('../models/user');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }

    const sellerList = await Seller.find(filter).populate('category');

    if (!sellerList) {
        res.status(500).json({ success: false });
    }
    res.send(sellerList);
});

router.get(`/:id`, async (req, res) => {
    const seller = await Seller.findById(req.params.id).populate('category');

    if (!seller) {
        res.status(500).json({ success: false });
    }
    res.send(seller);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const user = await User.findById(req.body.user);
    if (!user) return res.status(400).send('Invalid User');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let seller = new Seller({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        status: req.body.status,
        isFeatured: req.body.isFeatured,
        user: req.body.user,
        bKash: req.body.bKash,
        VoterId: req.body.VoterId
    });

    seller = await seller.save();

    if (!seller) return res.status(500).send('The seller cannot be created');

    res.send(seller);
});

router.put('/:id', async (req, res) => {
    const seller = await Seller.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true }
    )

    if (!seller)
        return res.status(400).send('the seller cannot be update!')

    res.send(seller);
})

router.delete('/:id', (req, res) => {
    Seller.findByIdAndRemove(req.params.id)
        .then((seller) => {
            if (seller) {
                return res
                    .status(200)
                    .json({
                        success: true,
                        message: 'the seller is deleted!',
                    });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'seller not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

router.get(`/get/count`, async (req, res) => {
    const sellerCount = await Seller.countDocuments((count) => count);

    if (!sellerCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        sellerCount: sellerCount,
    });
});

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const sellers = await Seller.find({ isFeatured: true }).limit(+count);

    if (!sellers) {
        res.status(500).json({ success: false });
    }
    res.send(sellers);
});

router.put(
    '/gallery-images/:id',
    uploadOptions.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Seller Id');
        }
        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if (files) {
            files.map((file) => {
                imagesPaths.push(`${basePath}${file.filename}`);
            });
        }

        const seller = await Seller.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths,
            },
            { new: true }
        );

        if (!seller)
            return res.status(500).send('the gallery cannot be updated!');

        res.send(seller);
    }
)

router.get(`/get/sellerorders/:userid`, async (req, res) => {
    const userOrderList = await Seller.find({ user: req.params.userid })

    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList);
})

    ;

router.get(`/get/:userid`, async (req, res) => {


    const userOrderList = await Seller.find({ user: req.params.userid })

    if (!userOrderList) {
        res.status(500).json({ success: false });
    }
    res.send(userOrderList);
});




module.exports = router;