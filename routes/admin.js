var express = require('express');
var router = express.Router();
var adminController =require('../controllers/adminControllers')
var productController = require('../controllers/productControllers')
const categoryController = require('../controllers/categoryController')
const subCategoryController = require('../controllers/subCategoryController')
const bannerController = require('../controllers/bannerController')
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponContoller')
const offerController = require('../controllers/offerController')
const Category= require('../models/categorySchema')
const adminVerify = require('../middleware/adminverify')

/* admin Login */
router.get('/',adminController.adminLogin);
router.post('/adminLogin',adminController.postLogin)

//set middlewares  for admin verification
router.use(adminVerify.verifyAdmin)
 
// admin home page
router.get('/dashboard',adminController.dashboard)
router.get('/adminlogout',adminController.adminLogout)

//user management
router.get('/view-users',adminController.usersList)
router.get('/blockUser/:id',adminController.blockUser)
router.get('/unblockUser/:id',adminController.unblockUser)
router.get('/deleteUser/:id',adminController.deleteUser)

// product management
router.get('/view-products',productController.getAllProducts)
router.get('/add-product',productController.addProduct)
router.post('/add-product',productController.postProduct)
router.get('/edit-product/:id',productController.editProduct)
router.post('/edit-product/:id',productController.postEditProduct)
router.get('/delete-product/:id',productController.deleteProduct)

// category management
router.get('/category-list',categoryController.categoryList)
router.post('/add-category',categoryController.postCategory)
router.get('/delete-category/:id',categoryController.deleteCategory)

//subcategory mangement
router.get('/subcategory-list',subCategoryController.subCategoryList)
router.post('/add-subcategory',subCategoryController.SubcategoryPost)

// coupon management
router.get('/coupon',couponController.couponList)
router.post('/coupon',couponController.postCoupon)
router.patch('/coupon-disable/:id',couponController.disableCoupon)
router.patch('/coupon-enable/:id',couponController.enableCoupon)
router.get('/edit-coupon',couponController.editCoupon)
router.post('/update-coupon',couponController.updateCoupon)

// banner mangement
router.get('/view-banner',bannerController.viewBanner)
router.get('/add-banner',bannerController.addBanner)
router.post('/add-banner',bannerController.postAddBanner)
router.get('/delete-banner/:id',bannerController.deleteBanner)
router.get('/edit-banner/:id',bannerController.editBanner)
router.post('/edit-banner/:id',bannerController.postEditBanner)

// order management
router.get('/view-orders',adminController.viewOrders)
router.post('/delivery-status/',adminController.deliveryStatus)
router.post('/approve-return',adminController.approveReturn)
router.post('/reject-return',adminController.rejectReturn)
router.get('/sales-report',adminController.salesReport)
router.post('/generate-sales-report',adminController.postSalesReport)

//offer management
router.get('/offer',offerController.viewOffer)
router.get('/add-offer',offerController.addOffer)
router.post('/add-offer',offerController.addOfferPost)
router.get('/delete-offer/:id',offerController.deleteOffer)
router.get('/edit-offer/:id',offerController.editOffer)
router.post('/edit-offer/:id',offerController.postEditOffer)
module.exports = router;
