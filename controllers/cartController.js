const { RequestClient } = require('twilio')
const { ObjectId } = require('bson');
const Product = require('../models/productSchema')
const Category = require('../models/categorySchema')
const SubCategory = require('../models/subCategorySchema')
const Cart=require('../models/cartSchema')
const fs = require('fs');
const { log } = require('console');
const { success } = require('toastr');
const { populate } = require('../models/userSchema');


   
//  add a product to cart
exports.addToCart = async (req,res)=>{
    let productId = new ObjectId(req.params.id)
    console.log(productId)
    let userId = req.session.user._id
    console.log(userId)
    try{
      if(req.session.user){
         const quantity = 1;
         let proObj ={
            item:productId,
            quantity:quantity,
            deliverystatus:"not shipped",
            orderstatus:"processing"
         }
         let userCart = await Cart.findOne({userId:new ObjectId(userId)})
         console.log(userCart);
         let cartCheckProId = req.params.id
         if(userCart){
            let proExist = userCart.product.findIndex(product =>product.item == cartCheckProId)
            if(proExist>-1){
                await Cart.updateOne({userId,"product.item":productId},{
                    $inc:{"product.$.quantity":1}
                })
            }else{
                await Cart.updateOne({userId},{$push:{product:proObj}})
            }
         }else{
                const cartObj = new Cart({
                    userId:userId,
                    product:[proObj]
                })
                console.log(cartObj)
                await Cart.create(cartObj)
                
            }
            console.log("added to cart");
            let stock =  await Product.findOneAndUpdate({_id : productId},{
              $inc: { stockQuantity : -1} },{ new : true}
            )
            console.log(stock.stockQuantity,"stock")

            
            res.json({success : true, stock : stock.stockQuantity})
                
          }else{
            res.json({success : false})
          }
    }catch(error){
        console.log(error) 
        res.redirect('/')

    }
}

// get the cart products
exports.getCartProducts = async (req,res)=>{
        let userId = req.session.user._id
        userId = userId.toString()
        console.log(userId)
        let cartItems=[];
   
    try{
        cartItems=await Cart.aggregate([
            {
                $match:{userId}
            },
            {
               $unwind:"$product"
            },
            {
                $project:{
                    item:{$toObjectId:"$product.item"},
                    quantity:"$product.quantity",
                },
            },
            {
                $lookup:{
                    from:'products',
                    localField:"item",
                    foreignField:"_id",
                    as:"productInfo",
                }
            },
            {
                $project:{
                    item:1,
                    quantity:1,
                    productInfo: { $arrayElemAt: ["$productInfo", 0] },
                }
            }
        ])
        console.log(cartItems,"cartitems")

        let total = await Cart.aggregate([
            {
                $match:{userId}
            },
            {
                $unwind:"$product",
            },
            {
                $project:{
                    item:{$toObjectId:"$product.item"},
                    quantity:"$product.quantity",
                }
            },
            {
                $lookup:{
                    from:"products",
                    localField:"item",
                    foreignField:"_id",
                    as:"productInfo",
                }
            },
            {
                $project: {
                    item: 1,
                    quantity: 1,
                    productInfo: {$arrayElemAt: ["$productInfo", 0]},
                   
                }
            },
            {
                $unwind: "$productInfo"
              },
              {
                $group: {
                  _id: null,
                  totalMrp: { $sum: {$multiply:[{$toDouble: "$quantity"},{$toDouble: "$productInfo.mrp" }] } },
                  totalPrice: { $sum: {$multiply:["$quantity","$productInfo.price"]}  }
                }
              }
            
        ])
        let user=req.session.user
   
     
      res.render('user/cart',{user,cartItems,total})
  
}catch(err){
    console.log(err)
    console.log("cart error");
}
}
// 



exports.changeProductQuantity = async (req, res) => {
    const { product, cart, count, quantity,stock } = req.body;
    const parsedCount = parseInt(count);
    const parsedQuantity = parseInt(quantity);
    const stockQuantity = parseInt(stock)
    console.log(stockQuantity,"stockkkkkkk")
    const cartId = cart;
    const productId = product;
    const objectIdCartId = new ObjectId(cartId);
    const objectIdproductId = new ObjectId(productId);
  
    try {
    let cart = await Cart.findOne({ userId: req.session.user._id });
    let userId = cart.userId;
    
      console.log(userId); 

      console.log("parsedCount:", parsedCount);
      console.log("parsedQuantity:", parsedQuantity);
      console.log("objectIdCartId:", objectIdCartId);
      console.log("objectIdproductId:", objectIdproductId);
      const quantity = parsedCount +parsedQuantity;

        let total = await Cart.aggregate([
          {
            $match: { userId: userId },
          },
          {
            $unwind: "$product",
          },
          {
            $project: {
              item: { $toObjectId: "$product.item" },
              quantity: "$product.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "productInfo",
            },
          },
          {
            $unwind: "$productInfo",
          },
          {
            $group: {
              _id: null,
              totalMrp: {
                $sum: {
                  $multiply: [
                    { $toDouble: quantity },
                    { $toDouble: "$productInfo.mrp" },
                  ],
                },
              },
              totalPrice: {
                $sum: {
                  $multiply: [
                    quantity,
                    "$productInfo.price",
                  ],
                },
              },
            },
          },
        ]);
          
          // console.log(total, "");
          
    
      
  
     let subtotal = await Cart.aggregate([
  {
    $match: { userId: userId }, // Replace 'userId' with the actual field that represents the user ID
  },
  {
    $unwind: "$product",
  },
  {
    $project: {
      item: { $toObjectId: "$product.item" },
      quantity: "$product.quantity",
    },
  },
  {
    $lookup: {
      from: "products",
      localField: "item",
      foreignField: "_id",
      as: "productInfo",
    },
  },
  {
    $unwind: "$productInfo",
  },
  {
    $group: {
      _id: null,
      subtotal: {
        $sum: {
          $multiply: [
            { $toDouble: quantity },
            "$productInfo.price",
          ],
        },
      },
    },
  },
]);
      console.log(subtotal[0].subtotal);
  
      // Extract only the subtotal amount for each product
      let subtotalAmounts = subtotal.reduce((acc,item) => acc+=item.subtotal,0);
  
      console.log("subtotalamounts",subtotalAmounts);
    //   console.log(subtotalAmounts[2]);
  
      if (parsedCount === -1 && parsedQuantity === 1) {
        console.log("if condition matched only 1 quantitiy");
        await Cart.updateOne(
          { _id: objectIdCartId },
          {
            $pull: { product: { item: objectIdproductId } },
          }
        );
  
        console.log("removed");


        let stock =  await Product.findOneAndUpdate({_id : objectIdproductId
        },{
          $inc: { stockQuantity : 0} },{ new : true}
        )
        console.log(stock.stockQuantity,"stock")

  
        res.json({
          success: true,
          removeProduct: true,
          total: total,
          subtotalAmounts: subtotalAmounts,
          subtotal: subtotal,
          quantity : quantity
        }); // Send removeProduct flag as true in the response
      } else {
        // console.log("else condition");
        console.log(parsedCount);
        await Cart.updateOne(
          { _id: objectIdCartId, "product.item": objectIdproductId },
          {
            $inc: { "product.$.quantity": parsedCount },
          }
        );
      }


      if(parsedCount == -1){
        let stock =  await Product.findOneAndUpdate({_id : objectIdproductId
        },{
          $inc: { stockQuantity : 1} },{ new : true}
        )
        console.log(stock,"stockkk")
      }else if(stockQuantity != 0) {
        let stock =  await Product.findOneAndUpdate({_id : objectIdproductId
        },{
          $inc: { stockQuantity : -1} },{ new : true}
        )
        console.log(stock,"stockk")

      }

      res.json({
        success: true,
        removeProduct: false,
        total: total,
        subtotalAmounts: subtotalAmounts,
        subtotal: subtotal,
        quantity: quantity
      });
    } catch (error) {
      console.error(error);
    }
  };

exports.removeItem = async (req,res)=>{
    console.log("cart remove");
    const {cart,product,quantity,stock,confirmResult} =req.body
    console.log(cart)
    console.log(product);
    const parsedQuantity = parseInt(quantity)
    const stockQuantity = parseInt(stock)
    const objectIdCartId = new ObjectId(cart)
    const objectIdProductId = new ObjectId(product)
    console.log(objectIdCartId);
    console.log(objectIdProductId);
    try {
        if(confirmResult){

          let stock =  await Product.findOneAndUpdate({_id : objectIdProductId
          },{
            $inc: { stockQuantity : parsedQuantity} },{ new : true}
          )
          console.log(stock,'updated stock')
            await Cart.findByIdAndUpdate(objectIdCartId,{
                $pull: { product:{item:objectIdProductId}}
            });console.log("pulled");
            res.json({success:true,removeProduct:true})
        }else{
            console.log("not pulled");
            res.json({success:false,removeProduct:false})
        }
    } catch (error) {
        console.log(error);
    }
}



