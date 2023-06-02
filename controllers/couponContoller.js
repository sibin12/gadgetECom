const Coupon = require('../models/couponSchema')
var voucher_codes = require("voucher-code-generator");
const mongoose = require("mongoose");

exports.couponList = async (req,res)=>{
    try {
        let adminDetails = req.session.admin;
        let coupon = await Coupon.find();
        console.log(adminDetails);
        console.log(coupon);
        res.locals.coupon = coupon;
        res.render('admin/coupon-list',{admin:true})
    } catch (error) {
        console.log(error)
    }
}

exports.postCoupon = async (req, res) => {
    console.log(req.body, "...body");
    const voucher = voucher_codes.generate({
      prefix: "CODE-",
      length: 7,
      charset: voucher_codes.charset("alphabetic"),
      postfix: "-OFF",
    });
    let strCoupon = voucher.toString();
    console.log(strCoupon);
    const newCoupon = new Coupon({
      couponCode: strCoupon,
      discount: req.body.discount,
      minPurchase: req.body.minPurchase,
      expires: req.body.expires,
      statusEnable: true,
    });
    await Coupon.create(newCoupon);
  
    res.redirect("/admin/coupon");
  };
  
  exports.disableCoupon = async (req, res) => {
    try {
      await Coupon.findByIdAndUpdate(
        { _id: req.params.id },
        {
          statusEnable: false,
        }
      );
  
      await res.json(true);
    } catch (error) {
      console.log(error);
    }
  };
  
  exports.enableCoupon = async (req, res) => {
    try {
      await Coupon.findByIdAndUpdate(
        { _id: req.params.id },
        {
          statusEnable: true,
        }
      );
  
      await res.json(true);
    } catch (error) {
      console.log(error);
    }
  };
  
  exports.editCoupon = async (req, res) => {
    try {
      let couponId = req.query.couponId;
      let couponDetails = await Coupon.findOne({ _id: couponId });
      res.json(couponDetails);
    } catch (error) {
      console.log(error);
    }
  };
  
  exports.updateCoupon = async (req, res) => {
    try {
      let { couponId, couponCode, couponDiscount, couponMinPurchase, couponExp } =
        req.body;
      let updatedCoupn = await Coupon.findByIdAndUpdate(
        { _id: couponId },
        {
          couponCode: couponCode,
          discount: couponDiscount,
          minPurchase: couponMinPurchase,
          expires: couponExp,
        },
        { new: true }
      );
      console.log(updatedCoupn, "updatedcoupon");
      await res.json(updatedCoupn);
    } catch (error) {
      console.log(error);
    }
  };
  

  exports.applyCoupon = async (req, res) => {
    try {
      const { couponId, total } = req.body;
      const cartTotal = parseInt(total.replace(/\D/g, ''), 10);
  
      const matchCouponId = await Coupon.findOne({
        couponCode: couponId,
        statusEnable: true,
        expires: { $gt: Date.now() },
      });
  
      if (!matchCouponId) {
        return res.json({ success: false, message: 'Invalid coupon code' });
      }
  
      if (cartTotal < matchCouponId.minPurchase) {
        return res.json({
          success: false,
          message: `Coupon requires a minimum purchase of Rs. ${matchCouponId.minPurchase}`,
        });
      }
  
      const discountPercentage = matchCouponId.discount;
      const discountAmount = Math.floor((discountPercentage / 100) * cartTotal);
      
      res.json({
        success: true,
        message: `Coupon applied! You received a discount of Rs. ${discountAmount} (${discountPercentage}% of the total ${cartTotal})`,
        discountAmount,
        discountPercentage,
        cartTotal,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'An error occurred while applying the coupon.' });
    }
  };
  
