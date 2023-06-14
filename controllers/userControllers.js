// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

const client = require("twilio")(accountSid, authToken);

const User = require('../models/userSchema')
const Product = require('../models/productSchema')
const Admin = require('../models/adminSchema')
const bcrypt = require('bcrypt')
const OTP = require('../models/otpSchema')
const Cart = require('../models/cartSchema')
const Banner = require('../models/bannerSchema')
const Address = require('../models/addressSchema')
const Offer = require('../models/offerSchema')
const Subcategory = require('../models/subCategorySchema')
const Category = require('../models/categorySchema');
const { verifyLogin } = require("../middleware/userverify");



exports.userIndex = async (req, res) => {
  try {
    const categoryId = await Category.findOne({ categoryName: "Mobile" }, "_id"); // Assuming "categoryName" is the field that stores the category name
    let products = await Product.find({category :categoryId}).sort({createdAt : -1}).limit(8)
    let banners = await Banner.find({})
    let offers = await Offer.find({})
    const laptopId = await Category.findOne({ categoryName: "laptop" }, "_id"); // Assuming "categoryName" is the field that stores the category name
    let recentProducts = await Product.find({category : laptopId}).sort({createdAt : -1}).limit(8) 
    res.render('user/index', { products, user: req.session.user, banners ,offers ,recentProducts})
  } catch (error) {
    console.log(error)
  }

}
exports.homePage = async (req, res) => {
  try {
    console.log(res.locals.count + "req.sessionsss")
    // console.log(req.session)
    let banners = await Banner.find({})
    const categoryId = await Category.findOne({ categoryName: "Mobile" }, "_id"); // Assuming "categoryName" is the field that stores the category name
    let products = await Product.find({category :categoryId}).sort({createdAt : -1}).limit(8)
    let offers = await Offer.find({})
    const laptopId = await Category.findOne({ categoryName: "laptop" }, "_id"); // Assuming "categoryName" is the field that stores the category name
    let recentProducts = await Product.find({category : laptopId}).sort({createdAt : -1}).limit(8)    
    let user = req.session.user
    let count = req.session.user.count
    res.render('user/index', { count, user, products, banners,offers ,recentProducts })
  } catch (error) {
    console.log(error)
  }

}
exports.getSignUp = (req, res) => {
  try {
    if (req.session.user) {
      res.redirect('/index')
    } else {
      res.render('user/signup', { signupErr : req.session.signupErr})
    }
  } catch (error) {
    console.log(error)
  }

}
exports.postSignUP = async (req, res) => {

  try {
    if (req.session.user) {
      res.redirect('/index')
    } else {
      let existingUser = await User.findOne({ email: req.body.email })
      let existingMobile = await User.findOne({mobile: req.body.mobile})
      if (existingUser) {
        console.log("this email is already taken");
        req.session.signupErr = "This Email is already exists"
        // res.locals.signupErr =req.session.signupErr;
        res.redirect('/signup')
      }
      else if (existingMobile){
         req.session.signupErr = "This Number is already exists"
        //  res.locals.signupErr =req.session.signupErr;
       res.redirect('/signup')
      } else {
         
        let hashedPassword = await bcrypt.hash(req.body.password, 10)

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
          password: hashedPassword,
          status: false,
          isActive: true
        })

        User.create(newUser)
        req.session.signupErr = false
        // res.locals.signupErr =req.session.signupErr;
        res.redirect('/signin')
      }
    }
  } catch (error) {
    console.log(error)
    res.redirect('/signup')
  }
}

exports.loginOtp = async (req, res) => {
  try {
    if (req.session.user) {
      res.redirect('/index')
    } else {
      res.render('user/loginOtp', { otpErr:req.session.otpErr })
    }

  } catch (error) {
    console.log(error)
  }
}
exports.postOtp = async (req, res) => {
  try {
    if (req.session.user) {
      res.redirect('/index')
    } else {

      const number = req.body.mobile;
     req.session.number = number;
userVerify = await User.findOne({ mobile: number });
console.log(userVerify, "userssssssss");

if (userVerify) {
  req.session.otpErr = false;
  console.log("User found in our database");
   client.verify.v2.services(serviceSid)
   .verifications
   .create({
    to:'+91'+number,
    channel:'sms'
   })
   .then((verification)=>{
    console.log(verification.sid,"the otp is generated ")
    // const otpExpiration = new Date().getTime() + 10 * 60 * 1000; // 10 minutes in milliseconds
    // req.session.otpExpiration = otpExpiration;  
    res.redirect('/verify')
    
    //  res.render('user/otp',{other:true,number,otpErr :req.session.otpErr })
   })
   .catch((error)=>{
    // res.render('user/loginOtp',{other : true})
    console.log("error in sending otp")
    console.log(error)
   })


      }else{
        req.session.otpErr = "this number is not registered"
        res.redirect('/loginOtp')
        // res.render('user/loginOtp', { message: "this number is not registered",other:true })
      }
    }
  } catch (error) {
    console.log(error);
  }
}

exports.resendOtp = async (req,res)=>{
  try {
    if (req.session.user) {
      res.redirect('/index')
    } else {
      console.log(req.body)
      console.log(req.parms)
      console.log(req.query)
      const number = req.body.mobile;
     req.session.number = number;
userVerify = await User.findOne({ mobile: number });
console.log(userVerify, "userssssssss");

if (userVerify) {
  req.session.otpErr = false;
  console.log("User found in our database");
   client.verify.v2.services(serviceSid)
   .verifications
   .create({
    to:'+91'+number,
    channel:'sms'
   })
   .then((verification)=>{
    console.log(verification.sid,"the otp is generated ")
    res.json({success:true})
   })
   .catch((error)=>{
    console.log("error in sending otp")
    console.log(error)
    res.json({success:false})
   })
      }else{
        req.session.otpErr = ""
        res.redirect('/loginOtp')
      }
    }
  } catch (error) {
    console.log(error);
  }
}
exports.verify = async (req,res)=>{
  res.render('user/otp',{ otpErr : req.session.otpErr, number : req.session.number})
}

exports.postOtpVerify = async (req, res) => {
  if (req.session.user) {
    res.redirect('/index')
  }
console.log(req.body)
console.log(req.query)
  const otp = req.body.code;
  const number = req.query.number
  console.log(otp);
  client.verify.v2.services(serviceSid)
  .verificationChecks
  .create({
    to:'+91'+number,
    code: otp
  })
  .then( async (verification)=>{
    console.log(verification.status,"otp verification status")
    if(verification.valid === true){
      console.log("otp vlid")
    let userVerify = await User.findOne({mobile :number})
    req.session.loggedIn = true;
        req.session.user = userVerify;
        req.session.otpErr = false
        res.render('user/otp-success', { user: req.session.user })
    }else{
      console.log("otp validation failed")
     req.session.otpErr = "entered otp is incorrect";
     res.redirect('/verify')
    }
  })
  .catch((error)=>{
    console.log(error)
  })

}

exports.getSignIn = (req, res) => {
  console.log("signin  get");
  if (req.session.user) {
    return res.redirect('/index')
  }
  res.render('user/signin', { loginErr: req.session.loginErr })
}

exports.postSignIn = async (req, res) => {
  // console.log(req.body);

  try {
    let user = await User.findOne({ email: req.body.email })
    if (user) {
      console.log('email valid');
      bcrypt.compare(req.body.password, user.password).then((status) => {
        if (status) {
          if (user.isActive) {
            console.log('user exists');
            req.session.user = user;
            req.session.loggedIn = true;
            res.redirect('/index');
          } else {
            req.session.loginErr = "User has been blocked "
            res.redirect('/signin')
          }

        } else {
          console.log('invalid  password')
          req.session.loginErr = "Invalid email or password"
          res.redirect('/signin');
        }
        // console.log(req.session.user)
      })
    } else {
      req.session.loginErr = "invalid email or password"
      res.redirect('/signin')
    }


  } catch (error) {
    console.log("email eerror")
    console.log(error);
    res.render('signin', { });
  }
}
exports.logOut = async (req, res) => {
  try {
    req.session.destroy()
    res.redirect('/')
  } catch (err) {
    console.log(err)
  }
}

exports.userProfile = async (req, res) => {
  try {

    let userId
    userId = req.session.user._id;
    let userDetails
    userDetails = await User.find({ _id: userId })

    let address = await Address.find({ user: userId }).populate('address')
    // console.log(address[0].address)
    if (address.length > 0) {
      address = address[0].address
    } else {
      address = {}
    }
    res.render('user/profile', { user: req.session.user, userDetails, address })
  } catch (error) {
    console.log(error);
  }

}


exports.editProfile = async (req, res) => {
  try {
    let user = req.session.user;
    const oldPasswordMatch = await bcrypt.compare(req.body.oldpassword, user.password);

    if (req.body.password && oldPasswordMatch) {
      const hashPassword = await bcrypt.hash(req.body.password, 10);
      updateUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
          name: req.body.name,
          mobile: req.body.mobile,
          password: hashPassword
        },
        { new: true }
      );

    } else if (!req.body.password && oldPasswordMatch) {
      updateUser = await User.findOneAndUpdate(
        { _id: user._id },
        {
          name: req.body.name,
          mobile: req.body.mobile,
        },
        { new: true }
      );
    } else {
      return res.json(false);
    }
    req.session.user.name = updateUser.name;
    return res.json({ response: true, success: true });
  } catch (err) {
    console.log(err);
    return res.json(false);
  }
};

exports.filterPost = async (req, res) => {
  console.log("////////////");

  let category = req.params.category;
  let brand = req.params.brands;
  console.log(category);
  console.log(brand);

  // get the category ID from the request parameters
  var categoryId = req.params.categoryId;
  console.log(categoryId, "🔥🔥🔥");

  try {
    const products = await Product.find({ category: categoryId })
    console.log(products);
    res.json(products); // Return the products as a JSON response
  } catch (error) {
    console.log(error);
  }
};

exports.filterSub = async (req, res) => {
  const sub = req.params.subcategoryId;
  console.log(sub);

  try {
    const products = await Product.find({ company: sub })
    console.log(products);

    // Send the filtered products to the client
    res.json(products);
  } catch (error) {
    console.log(error);
  }
};

exports.shop = async (req,res)=>{
  try {
    let user = req.session.user;
    // console.log(products);
  
    const pageNum = parseInt(req.query.page) || 1;
    console.log(pageNum, "selected page");
    const perPage = 6;
    const totalCount = await Product.countDocuments();
    console.log(totalCount)
  
    const pages = Math.ceil(totalCount / perPage);
  
    const products = await Product.find()
    .skip((pageNum - 1) * perPage)
    .limit(perPage);
    console.log(products,"products in the mobile page")
    const categories = await Category.find({})
    console.log(categories,"-----------------------------------------")
    const subcategories = await Subcategory.find({})
    console.log(subcategories,"-----------------------------------------")
     
    res.render("user/shop", {
      products,
      subcategories,
      categories,
      user,
      pageNum: pageNum,
      perPage: perPage, 
      totalCount: totalCount,
      pages: pages,
    });
   
} catch (error) {
    console.log(error)
}

}















