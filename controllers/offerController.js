const Offer = require('../models/offerSchema')
const Category = require('../models/categorySchema')
const Product = require('../models/productSchema')
const fs = require('fs')
const multer = require('multer')
const path = require('path')

const offerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./public/uploads/offer")
    },
    filename: function (req, file, cb) {
        return cb(null, req.body.name + path.extname(file.originalname))
    }
})

const upload = multer() 
const uploadOffer = multer({ storage: offerStorage })


exports.viewOffer = async (req,res)=>{
    try {
        const offer =  await Offer.find().populate("category")
        console.log(offer,"offersssssssss")
        res.render('admin/view-offer',{admin:true,offer})

    } catch (error) {
        console.log(error)
    }
}
exports.addOffer = async (req,res)=>{
    try {
        let categories = await Category.find()
        res.render('admin/add-offer',{admin:true,categories})
    } catch (error) {
        console.log(error)
    }
}
exports.addOfferPost = async (req,res)=>{
    
    console.log(req.body,'body')
    console.log(req.body.name)
    console.log(req.file)

 uploadOffer.single('image')(req,res,async (err) => {
    if (err) {
        console.log(err)
        return next(err)
    }
    try{
        const newOffer= new Offer({
            name:req.body.name,
            category:req.body.category,
            percentage: req.body.percentage,
            image:req.body.name + path.extname(req.file.originalname)
        })
        await Offer.create(newOffer)
        res.redirect('/admin/offer')
        
    } catch (error) {
        console.log(error)
    }
})
    
}

exports.editOffer = async (req,res)=>{
    console.log("offer edit");

    try {
        let category = await Category.find()

    let offer = await  Offer.findOne({_id : req.params.id}).populate("category")     
        console.log(offer,"kkkkkkkk")
        res.render('admin/edit-offer',{admin:true,offer,category})
    } catch (error) { 
        console.log(error);
    }
}

exports.postEditOffer = async (req, res, next) => {
    try {
      const offer = await Offer.findById(req.params.id);
      const existingImg = offer.image;
  
      uploadOffer.single('image')(req, res, async (err) => {
        if (err) {
          console.log(err);
          return next(err);
        }
  
        let newImage = offer.image;
        if (req.file) {
          newImage = req.body.name + path.extname(req.file.filename);
        }
  
        const updatedOffer = await Offer.updateOne(
          { _id: req.params.id },
          {
            name: req.body.name,
            category:req.body.category,
            percentage: req.body.percentage,
            image: newImage,
          }
        );
  
        console.log("offer updated successfully");
  
        if (req.file && req.file.filename !== existingImg) {
          const deleteImg = existingImg;
          fs.unlink('./public/uploads/offer/' + deleteImg, (err) => {
            if (err) throw err;
            console.log(`${deleteImg} deleted successfully`);
          });
        }
  
        res.redirect('/admin/offer');
      });
    } catch (error) {
      console.log(error);
      // Handle the error appropriately
      next(error);
    }
  };
  



exports.deleteOffer = async (req,res)=>{
    try {
        await Offer.deleteOne({_id:req.params.id})
        res.redirect('/admin/offer')
    } catch (error) {
        console.log(error);
    }
}


exports.offerViewUser = async (req,res)=>{
try {
    console.log(req.body,"bodyyyyyyyyyyyyyyyyyyyyyyyyyyy")
    console.log(req.query)
    const image= req.query.img;

    console.log(image,"image")
//     const percentage = parseFloat(req.query.percentage);
// const categoryId = req.query.categoryId;


const percentage = parseFloat(req.query.percentage);
const categoryId = req.query.categoryId;

const products = await Product.find({ category: categoryId });
console.log(products,"mobilesssssssssss")
const filteredProducts = products.filter((product) => {
  const offerPercentage = parseFloat(product.offer.replace('%', ''));
  return offerPercentage > percentage;
});

console.log(filteredProducts);


// console.log(products,"products tahat fsdfasfasf");

    res.render('user/offerpage',{products : filteredProducts,user :req.session.user,image})
} catch (error) {
    console.log(error)
}
}