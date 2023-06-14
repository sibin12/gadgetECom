const Address = require('../models/addressSchema')
const Cart = require('../models/cartSchema')
const Order = require('../models/orderSchema')
const Product = require('../models/productSchema')
const Coupon = require('../models/couponSchema')
const Razorpay = require('razorpay')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;


var instance = new Razorpay({
    key_id: process.env.razorpay_key_id,
    key_secret: process.env.razorpay_key_secret,
  });

  
exports.checkOut = async (req,res)=>{
  let userId= req.session.user._id
  let address = await Address.findOne({user:userId})
  let coupons = await Coupon.find({})
  // console.log(address.address.length,"lllllllllllllll");
  if(!address || address.address.length === 0){
    return res.redirect('/address') 
}

    try{
        // let address = await Address.findOne({user:userId})
        if( address){
          address= address.address
        }else{
          //  res.redirect('/address')
          address = []
        }
       
        // console.log(address,"////////////////")
        
        // let userId = req.session.user._id
        userId = userId.toString()
        console.log(userId)
        let cartItems=[];
   
    //    console.log('finding cart')
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
        // console.log(cartItems)

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
                $project:{
                    item:1,
                    quantity:1,
                    productInfo:{$arrayElemAt:["$productInfo",0]},
                }
            },
            {
                $group:{
                    _id:null,
                    total:{$sum:{$multiply:["$quantity","$productInfo.price"]}}
                }
            }

        ])
        res.render('user/checkout',{user:req.session.user,address,cartItems,total,coupons})
        
        // console.log(total)
    }catch(err){
        console.log(err);
    }
  }

exports.postCheckOut = async (req,res)=>{
    try {
        // console.log("///////////////////////////////////////////tttttttttttttttttttttttttttt");
     const order = req.body
    //  console.log(order ,"jhfjsfdhjdfshhhhhhhhhhhhhhhhhhhhhhhhh")
     let cod = req.body['payment-method']
//   console.log(cod)
  let addressId= order['address-check'];
//   let addressId = new mongoose.Types.ObjectId(req.body.address);
//   console.log(addressId)

   const addressDetails = await Address.findOne(
      { "address._id": addressId },
      { "address.$": 1 }
    );

  // console.log(addressDetails,"addressdetail");

  let filteredAddress = addressDetails.address[0]
//   console.log(filt,"lllllllllllllllll");
let userId =req.session.user._id;
let cart = await Cart.findOne({userId:req.session.user._id});

    // console.log(cart.product,"-----------------------------");
 //   total by aggregation 
//  let total = await Cart.aggregate([
//     {
//         $match:{userId}
//     },
//     {
//         $unwind:"$product",
//     },
//     {
//         $project:{
//             item:{$toObjectId:"$product.item"},
//             quantity:"$product.quantity",
//         }
//     },
//     {
//         $lookup:{
//             from:"products",
//             localField:"item",
//             foreignField:"_id",
//             as:"productInfo",
//         }
//     },
//     {
//         $project:{
//             item:1,
//             quantity:1,
//             productInfo:{$arrayElemAt:["$productInfo",0]},
//         }
//     },
//     {
//         $group:{
//             _id:null,
//             total:{$sum:{$multiply:["$quantity","$productInfo.price"]}}
//         }
//     }

// ])
const total = req.body.total;
 const  Ctotal =total.replace('₹', '');
  let totalAmount= parseInt(Ctotal);
console.log(Ctotal,"totallllllllllllllllll");

console.log(cart,"nnnnnnnnnnnnnnnnnnnnnnkkkkkkkkkk");
         
let prod = cart.product;

//status
    let status = req.body['payment-method'] === 'COD' ? 'placed' : 'pending'
// console.log(status);
      if(req.body['payment-method']){
// console.log(filteredAddress.firstName,'+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    let orderObj = new Order({
        deliveryDetails: {
            firstName: filteredAddress.firstName,
            lastName: filteredAddress.lastName,
            state: filteredAddress.state,
            district: filteredAddress.district,
            streetAddress: filteredAddress.streetAddress,
            appartment: filteredAddress.appartment,
            town: filteredAddress.town,
            pin: filteredAddress.pin,
            number: filteredAddress.number,
            email: filteredAddress.email,
        },
        userId: cart.userId,
        paymentMethod: req.body['payment-method'],
        products: prod,
        // totalAmount: total[0].total,
        totalAmount: totalAmount,
        paymentstatus: status,
        deliverystatus:'not shipped',
        createdAt: new Date()
    })
    // console.log(prod,"++++++++++++++++++++++++++++++++")
    // console.log(orderObj,"")
    let orderDoc = await Order.create(orderObj);
    req.session.user.count = 0;

    let orderId = orderDoc._id;
    let orderIdString = orderId.toString();
    console.log(orderIdString, "order id  string")

    console.log("******************",orderDoc,"**********************************");
     await Cart.findOneAndDelete({userId:cart.userId})
     if(req.body['payment-method'] == 'COD'){
        res.json({CODSuccess:true})
     }
      else if (req.body["payment-method"] == 'Razorpay')
       {
        console.log("razorpay selected");
        console.log(orderDoc._id, "id of order");
        var options = {
            amount: orderDoc.totalAmount * 100, // amount in the smallest currency unit
            currency: "INR",
          receipt: orderIdString,
        };
        instance.orders.create(options, function (err, order) {
            // console.log(err);
            console.log(order, "new order");

          res.json(order);
        });
    }
  }else{
    console.log("method not selected")
  }

    } catch (error) {
        console.log(error);
    }
}

exports.orderPlaced = async (req,res)=>{
    try {
        console.log("order placed");
        res.render('user/order-placed',{user:req.session.user})
        
    } catch (error) {
        console.log(error);
    }
}

exports.verifyPayment = async (req, res) => {
    console.log(req.body, "..success of order");
  
    try {
      let details = req.body;
      console.log(details,",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,");
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "i0d3aF8FNUqUbVwOd8mOLKqy");
      hmac.update(
        details['payment[razorpay_order_id]'] +
          "|" +
          details['payment[razorpay_payment_id]']
      );
      hmac = hmac.digest("hex");
      console.log(hmac,"hmacccccc");
      let orderResponse = details['order[receipt]']
      let orderObjId = new ObjectId(orderResponse);
      console.log(orderObjId,"orderobjjjjjjjjjjj");
  
      if (hmac === details['payment[razorpay_signature]']) {
        await Order.updateOne(
          { _id: orderObjId },
          {
            $set: {
              paymentstatus: "placed",
            },
          }
        );

  
        console.log("payment is successful");
        res.json({ status: true });
      } else {
        await Order.updateOne(
          { _id: orderObjId },
          {
            $set: {
              paymentstatus: "failed",
            },
          }
        );
        console.log("payment is failed");
        res.json({ status: false, errMsg: "" });
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  
      

exports.paymentFailed = async (req,res)=>{
    res.render('user/payment-failed',{})
}

exports.orderDetails = async (req,res)=>{

    try {
        let userId = req.session.user._id;
 console.log(userId);
 userId= new ObjectId(userId)
        let orders = await Order.find(
            { userId : userId })
            .sort("-updatedAt")
            .populate({
                path:"products.item",
                model:"Product"
            }).exec()
            // console.log(orders[0].products,"nnn");
         
        //  console.log(orders,"orders");

        // let user = req.session.user;
        console.log(orders,"ordersssssssssssssssssssssssssssssss")
  let order = req.params.id;
  let cond = new ObjectId(order);
        let cartItems = await Order.aggregate([
            {
              $match: { _id: cond },
            },
            {
              $lookup: {
                from: "products",
                localField: "product.item",
                foreignField: "_id",
                as: "productInfo",
              },
            },
            {
              $project: {
                _id: 1,
                deliveryDetails: 1,
                userId: 1,
                paymentMethod: 1,
                products: 1,
                totalAmount: 1,
                paymentstatus: 1,
                deliverystatus: 1,
                createdAt: 1,
                productInfo:1,
              }
            },
            {
            $unwind :"$productInfo"
            }
        ])
        console.log(cartItems,"****************************");
   
            res.render('user/orders',{ orders,user:req.session.user})
             
        } catch (error) {
            console.log(error);
        }
}


exports.cancelOrder = async (req,res)=>{
userId = req.session.user._id;
   let cart = await Cart.find({_id:userId}).populate('product')
   console.log(cart,"llllllllllllllllllllllllllllllll");



    let productId = req.query.productId;
    console.log(productId,"//////////");
    let orderId = req.query.orderId;
    console.log(orderId);
    let orders = await Order.find({_id : orderId}).populate({
        path: 'products.item',
        model:'Product'
    }).exec()
    console.log(orders);
    let product = null;
    for(let i=0;i<orders.length;i++){
        let order = orders[i];
        product = order.products.find(product => product.item._id.toString() === productId)
           console.log(product,"product for cancell ")
        if(product){
          console.log(product.item.stockQuantity,"stock")
            console.log("product find");
           console.log(product.orderstatus,"statusssssssssssssssss")
                   await Product.findOneAndUpdate({_id : product.item._id},{ $inc :{stockQuantity: 1 }})   //updating the stock 

            product.orderstatus = 'cancelled';
            product.deliverystatus = 'cancelled';
            await order.save();
            break;  
        }
    }
    res.redirect('/orders')
    console.log("delteddddddd");
    
}

exports.returnOrder = async(req,res)=>{
     
    let productId = req.query.productId
    let orderId = req.query.orderId;
    console.log(productId,orderId,'first pro second order')
  
    let orders = await Order.find({ _id: orderId })
    .populate({
      path: 'products.item',
      model: 'Product'
    }).exec();
  
  
    let product = null;
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      product = order.products.find(product => product.item._id.toString() === productId);
      if (product) {

        // await Product.findOneAndUpdate({_id : product.item._id},{ $inc :{stockQuantity: 1 }})   //updating the stock 

        product.orderstatus = 'returned';
        product.deliverystatus ='returned';
        await order.save();
        break; // Exit the loop once product is found
      }
    }
    console.log(orders,'totalllllll')
    console.log(product,'i got the product')
    res.redirect('/orders')
  }

exports.invoice = async (req,res)=>{
    let productId = req.query.productId
    let orderId = req.query.orderId;
    console.log(productId,orderId,'first pro second order')
  
    let orders = await Order.find({ _id: orderId })
    .populate({
      path: 'products.item',
      model: 'Product'
    }).exec();
  
  
    console.log(orders,'total')
  
  
    let product = null;
    for (let i = 0; i < orders.length; i++) {
      let order = orders[i];
      product = order.products.find(product => product.item._id.toString() === productId);
      if (product) {
        // If product found, fetch the details from the Product model
        break; // Exit the loop once product is found
      }
    }
    
  
    console.log(product,'particluar')
    console.log(orders,'total')
  
     res.render('user/invoice',{orders,product,user: req.session.user,other:true});
  }
