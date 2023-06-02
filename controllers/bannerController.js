const { log } = require('console')
const Banner = require('../models/bannerSchema')
const fs = require('fs')
const multer = require('multer')
const path = require('path')

const bannerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./public/uploads/banner")
    },
    filename: function (req, file, cb) {
        return cb(null, req.body.name + path.extname(file.originalname))
    }
})

const upload = multer()
const uploadBanner = multer({ storage: bannerStorage })


exports.viewBanner = async (req, res) => {
    try {
        let banner = await Banner.find({})
        // console.log(banner ) 
        res.render('admin/view-banner', { banner, admin: true })
    } catch (error) {
        console.log(error);
    }
}
exports.addBanner = async (req, res) => {
    try {
        res.render('admin/add-banner', { admin: true })
    } catch (error) {
        console.log(error);
    }
}
exports.postAddBanner = async (req, res) => {
    console.log('body')
    console.log(req.body.name);

    uploadBanner.single('image')(req, res, async (err) => {
        if (err) {
            console.log(err)
            return next(err)
        }
        try {
            const newBanner = new Banner({
                name: req.body.name,
                description: req.body.description,
                image: req.body.name + path.extname(req.file.originalname)
            })
            await Banner.create(newBanner)
            res.redirect('/admin/view-banner')

        } catch (err) {
            console.log(err)
            res.redirect('/admin/add-banner')
        }

    })

}

exports.editBanner = async (req, res) => {
    console.log("banner edit");

    try {
        let banner = await Banner.findOne({ _id: req.params.id })
        console.log(banner, "kkkkkkkk")
        res.render('admin/edit-banner', { admin: true, banner })
    } catch (error) {
        console.log(error);
    }
}

exports.postEditBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);
        const existingImg = banner.image;

        uploadBanner.single('image')(req, res, async (err) => {
            if (err) {
                console.log(err);
                return next(err);
            }

            let newImage = banner.image;
            if (req.file) {
                newImage = req.body.name + path.extname(req.file.filename);
            }

            const updatedBanner = await Banner.updateOne(
                { _id: req.params.id },
                {
                    name: req.body.name,
                    description: req.body.description,
                    image: newImage,
                }
            );

            console.log("Banner updated successfully");

            if (req.file && req.file.filename !== existingImg) {
                const deleteImg = existingImg;
                fs.unlink('./public/uploads/banner/' + deleteImg, (err) => {
                    if (err) throw err;
                    console.log(`${deleteImg} deleted successfully`);
                });
            }

            res.redirect('/admin/view-banner');
        });
    } catch (error) {
        console.log(error);
        // Handle the error appropriately
        next(error);
    }
};




exports.deleteBanner = async (req, res) => {
    try {
        await Banner.deleteOne({ _id: req.params.id })
        res.redirect('/admin/view-banner')
    } catch (error) {
        console.log(error);
    }
}
