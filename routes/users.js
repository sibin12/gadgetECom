var express = require('express');
var router = express.Router();
var userController = require('../controllers/userControllers')
var productController = require('../controllers/productControllers');
const addressController = require('../controllers/addressController')
const orderController = require('../controllers/orderController')
const cartController = require('../controllers/cartController')
const couponController = require('../controllers/couponContoller')
const wishlistController = require('../controllers/wishlistController')
const categoryController = require('../controllers/categoryController')
const offerController = require('../controllers/offerController')
const subcategoryController = require('../controllers/subCategoryController')
const nocache = require('nocache');
const userVerify= require('../middleware/userverify')

// middlewares
router.use(userVerify.cartCount)
router.use(userVerify.wishListCount)
router.use(userVerify.subCategories)

/* GET home page. */
router.get('/', userController.userIndex)
router.get('/index',userVerify.verifyLogin, userController.homePage)
router.get('/mobile',categoryController.mobile)
router.get('/laptop',categoryController.laptop)
router.get('/offer-view-user/',offerController.offerViewUser)
router.get('/subcategorySearch/',subcategoryController.subCategorySearch)

//category and subcategory controller
router.get('/shop',userController.shop)
router.get('/filter/:categoryId', userController.filterPost)
router.get('/filterSub/:subcategoryId', userController.filterSub)
  //order management
router.get('/checkout',userVerify.verifyLogin,orderController.checkOut)
router.post('/checkout',userVerify.verifyLogin,orderController.postCheckOut)
router.get('/orderPlaced',userVerify.verifyLogin,orderController.orderPlaced)
router.post('/verify-payment',userVerify.verifyLogin,orderController.verifyPayment)
router.get('/payment-failed',userVerify.verifyLogin,orderController.paymentFailed)
router.get('/orders',userVerify.verifyLogin,orderController.orderDetails)
router.get('/cancel-order/',userVerify.verifyLogin,orderController.cancelOrder)
router.get('/return-order',userVerify.verifyLogin,orderController.returnOrder)
router.get('/invoice/',userVerify.verifyLogin,orderController.invoice)

// user management
router.get('/signin', userController.getSignIn)
router.post('/signin', userController.postSignIn)
router.get('/signup',userController.getSignUp)
router.post('/signup',userController.postSignUP)
router.get('/logout',userController.logOut)

//otp management
router.get('/loginOtp',userController.loginOtp)
router.post('/loginOtpPost',userController.postOtp)
router.get('/verify',userController.verify)
router.post('/otpverify',userController.postOtpVerify)
router.post('/resend-otp',userController.resendOtp)

// profile management
router.get('/profile',userVerify.verifyLogin,userController.userProfile)
router.post('/edit-profile',userVerify.verifyLogin,userController.editProfile)

// product management
router.get('/product-view/:id',productController.productView)
router.get('/search',productController.search)

// cart management
router.get('/cart',userVerify.verifyLogin, cartController.getCartProducts)
router.get('/addToCart/:id',userVerify.verifyLogin,cartController.addToCart)
router.post('/removeItem',userVerify.verifyLogin,cartController.removeItem)
router.post('/changeProductQuantity',userVerify.verifyLogin,cartController.changeProductQuantity)

//coupon management
router.post('/apply-coupon',couponController.applyCoupon)

//address management
router.get('/address', userVerify.verifyLogin, addressController.getAddress)
router.post('/add-address', userVerify.verifyLogin,addressController.addAddress)
router.delete('/deleteAddress/:id', userVerify.verifyLogin,addressController.deleteAddress)
router.get('/editAddress/:id',userVerify.verifyLogin,addressController.editAddress)
router.post('/editAddress/:id',userVerify.verifyLogin,addressController.postEditAddress)

// wishlist management
router.get('/wishlist',wishlistController.whishList)
router.get('/addToWishlist/:id',wishlistController.addToWishlist)
router.get('/wishlist/:id',wishlistController.removeFromWishlist);
module.exports = router;

