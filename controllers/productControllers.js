const { RequestClient } = require('twilio')
const { ObjectId } = require('bson');
const Product = require('../models/productSchema')
const Category = require('../models/categorySchema')
const SubCategory = require('../models/subCategorySchema')
const  banners = require('../models/bannerSchema')
const Cart=require('../models/cartSchema')
const multer = require('multer')
const fs = require('fs');
const { log } = require('console');
const { success } = require('toastr');
const { populate } = require('../models/userSchema');
const { match } = require('assert');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./public/uploads")
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({ storage }) 

exports.addProduct = async (req, res) => {
    const categories = await Category.find({})
    const subcategory = await SubCategory.find({})

    res.render('admin/add-product', { admin: true,categories ,subcategory})
}
exports.postProduct = async (req, res, next) => {

upload.array('image', 5)(req, res, async (err) => {
        if (err) {
            console.log(err)
            return next(err)
        }
        console.log(req.body)
        console.log(req.file)
    
    try{
        
        console.log(req.body.offer,"offrrrrrrrrrrrrrrrrrrrrrrrr");
        let newProduct = new Product({
            
            name:req.body.name,
            storage:req.body.storage,
            category:req.body.category,
            company:req.body.company,
            description:req.body.description,
            mrp:req.body.mrp,
            price:req.body.price,
            offer:req.body.offer,
            stockQuantity:req.body.stockQuantity,
            images:req.files.map(file => file.filename)
        })
        await Product.create(newProduct)
        res.redirect('/admin/view-products')
        console.log(newProduct)
    }catch(error){
        console.log("creation error" )
        console.log(error)
    }
})
}


exports.getAllProducts = async (req,res)=>{
    try{
    let products = await Product.find({}).populate("category").populate("company");
    console.log(products,"___________________");
    res.render('admin/view-products',{admin:true,products})
    }catch(err){
        console.log(err)
    }
}
exports.editProduct = async (req,res)=>{
    let product = await Product.findOne({_id: req.params.id}).populate("category").populate("company")
    console.log(product,"++++++++++++++++++++++++++++++++++++++++");
    let category= await Category.find({})
    let subcategory = await SubCategory.find({})
    if(product){
        res.render('admin/edit-product',{category,product,subcategory,admin:true})
    }else{
        console.log('not find product')
    }
}
exports.postEditProduct = async (req,res)=>{
    const product = await Product.findById(req.params.id)
    // fs.unlink('./public/uploads' + image.filename, (err) => {
    //     if (err) throw err
    //     console.log("product image Deleted");
    // })
    const existingImages = product.images;

  
  
   console.log(existingImages,"images")
    upload.array('image',5)(req,res,async(err)=>{
        if(err){
            console.log('upload error in edit product')
            console.log(err)
        }
        try{
            const product = await Product.findById(req.params.id)
            let imageFiles = [];
  
      
            if (req.files && req.files.length > 0) {
              // If new images are uploaded, set them as the imageFiles
              imageFiles = req.files.map(file => file.filename);
            } else {
              // If no new images are uploaded, keep the existing ones
              imageFiles = product.images;
            }

            let items =await Product.updateOne({_id:req.params.id},{
                name:req.body.name,
                storage:req.body.storage,
                category:req.body.category,
                company:req.body.company,
                description:req.body.description,
                mrp:req.body.mrp,
                price:req.body.price,
                offer:req.body.offer,
                stockQuantity:req.body.stockQuantity,
                images:imageFiles,
            })
            console.log(items)

            const newImages = req.files.map(file=>file.filename)
            console.log(newImages);
            if(newImages.length>0){
                const deletedImages =existingImages.filter(image => !newImages.includes(image))
                console.log(deletedImages);
            //   if(deletedImages){
               for (const image of deletedImages) {
                   fs.unlink('./public/uploads/' + image, (err) => {
                     if (err) throw err;
                     console.log(`${image} deleted successfully`);
                   });  
                 }
                }
            // }
            else{
                console.log('nothing to delete')
            }
          

            await res.redirect('/admin/view-products')

        }catch(err){
            console.log(err)
        }

    })
   
}
exports.deleteProduct  = async (req,res)=>{
    await Product.deleteOne({_id:req.params.id})
    res.redirect('/admin/view-products')
}

// user side //

exports.productView = async (req,res)=>{
    try{
    const singleProduct = await Product.findOne({_id:req.params.id})
    const products = await Product.find()
     res.render('user/product-view',{singleProduct,user:req.session.user,products})
    }catch(er){
        console.log(er);
    }
}

exports.search  = async (req,res)=>{
   
    const query = req.query.query; // Get the search query from the request body


    req.session.searchQuery = query;

    console.log(query,"kkkkkkkkkkkkkkkk")
  // Escape special characters in the search query and create a case-insensitive regular expression

  const regexQuery = new RegExp(escapeRegex(query), 'i');

  try {
    const matchingProducts = await Product.find({ name: regexQuery }).exec();

    res.render('user/searchResults', { products: matchingProducts });
  } catch (err) {
    console.error('Error searching for products:', err);
    res.render('user/searchResults', { products: [] });
  }

  

    }      
      // Function to escape special characters in the search query
      function escapeRegex(text) {
        if (!text) return '';
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      }
      
      


