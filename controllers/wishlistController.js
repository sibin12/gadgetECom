const Wishlist = require('../models/wishlistSchema');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Product = require('../models/productSchema')

exports.whishList = async (req,res)=>{
    console.log("whishlist")
    try{
    if(req.session.user){
        const wishItems = await Wishlist.find({ user_id: req.session.user._id }).populate('products.product_id');
       if (!wishItems) {
         // Handle the case when no wishlist is found
        
        res.render('user/wishlist' ,{user:req.session.user})
       }else {
          
         
       res.render('user/wishlist',{wishItems,user:req.session.user})
       }
       
      } else{
         res.redirect('/signin')
     }
    }catch(error){
        console.log(error)
    }
}
 
exports.addToWishlist = async (req, res) => {
    try {

        if(req.session.user){
      const productId = new ObjectId(req.params.id);
      const userId = req.session.user._id;
      const proObj = {
        product_id: productId,
      };
  
      const wishListItem = await Wishlist.findOne({ user_id: userId });
      const checkProductId = req.params.id;
  
      if (wishListItem) {
        const proExist = wishListItem.products.findIndex(
          (product) => product.product_id.toString() === checkProductId
        );
  
        if (proExist > -1) {
          console.log('Product already exists in wishlist');
          return res.json({ success: false });
        } else {
          console.log('Adding product to existing wishlist');
          await Wishlist.updateOne(
            { user_id: userId },
            { $push: { products: proObj } }
          );
          return res.json({ success: true });
        }
      } else {
        const newItem = new Wishlist({
          user_id: userId,
          products: [proObj],
        });
        console.log('Creating new wishlist');
        await Wishlist.create(newItem);
        return res.json({ success: true });
      }
    }else{
        return res.json({login :true})
    }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  };
  
  exports.removeFromWishlist = async(req,res)=>{
    console.log("removing from wishlist")
    try{
        let productIdToRemove =req.params.id;
      let updatedDoc =  await Wishlist.findOneAndUpdate(
        { user_id: req.session.user._id },
        { $pull: { products: { product_id: productIdToRemove } } },
        { new: true }
      );
      console.log(updatedDoc,"updated data")
     
      res.redirect('/wishlist')
    }catch(error){
        console.log(error)
    }
}


