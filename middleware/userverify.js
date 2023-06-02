const Cart = require('../models/cartSchema')
const User = require('../models/userSchema')
const wishlist = require('../models/wishlistSchema')
const Subcategory = require('../models/subCategorySchema')

exports.verifyLogin=async(req,res,next)=>{
    if(req.session.user){
        next()
    }else{
        res.redirect('/signin')
    }
  }

// exports.verifySignup = async (req,res,next)=>{
//     if(req.session.user){
//         next()
//     }
//     res.redirect('/signup')
// }


exports.cartCount = async (req,res,next)=>{
    // console.log('helloooooooooooooooooooooooooo')
    if(req.session.user){

        let count = 0;
        let cart = await Cart.findOne({userId:req.session.user._id})
        console.log(cart);
        if(cart){
            count = cart.product.reduce((acc,product)=>acc+product.quantity,0);
            console.log(count)
            req.session.user.count = count;

            res.locals.count = req.session.user.count

        }
        next()
    }else{
        next()
    }
  }
 
  exports.wishListCount = async(req,res,next)=>{
    if (req.session.user) {
       
        // console.log()
        let wishListCount = 0
        const wishItem = await wishlist.findOne({user_id:req.session.user._id})
        const user = await User.findOne({_id:req.session.user._id})
        res.locals.user = user
        if(wishItem){
            wishListCount = wishItem.products.length;
            req.session.user.wishListCount = wishListCount;
            res.locals.wishListCount=req.session.user.wishListCount;
        }
       
        next();
    } else{
        next();
    }
}

exports.subCategories = async(req,res,next)=>{
    let subCategories = await Subcategory.find({}).populate('category_id')
    res.locals.subCategories = subCategories;

    // console.log(subCategories)
    next()
}