const Category = require('../models/categorySchema')
const SubCategory = require('../models/subCategorySchema')
const Product = require('../models/productSchema')
const { logOut } = require('./userControllers')


exports.subCategoryList = async (req,res)=>{
    try {
        const categories = await Category.find({});
        // console.log(categories);
        const subcategories = await SubCategory.find({}).populate("category_id"); 
        
        console.log(subcategories,"+++++++++++++++++++++++++++++++++++");

        res.render('admin/subcategory-list',{admin:true,categories,subcategories, subcategoryErr:req.session.subcategoryErr})
    } catch (error) {
        console.log(error);
    }
}

exports.SubcategoryPost = async (req, res) => {
    console.log(req.body.category);
  
    try {
      const checkSub = await SubCategory.find({ category_id: req.body.category });
  
      if (checkSub.length > 0) {
        let checking = false;
  
        for (let i = 0; i < checkSub.length; i++) {
          if (
            checkSub[i]["sub_category"].toLowerCase() === req.body.subcategory.toLowerCase()
          ) {
            checking = true;
            console.log("same subcategory");
            break;
          }
        }
  
        if (checking === false) {
          console.log("new category");
  
          const subCategory = new SubCategory({
            sub_category: req.body.subcategory,
            category_id: req.body.category,
          });
  
          const subcat = await subCategory.save();
  
          console.log(subcat);
            req.session.subcategoryErr = false
          res.redirect("subcategory-list");
        } else {
            req.session.subcategoryErr = " Same subcategory already exists"
            res.redirect("subcategory-list")
        //   res.status(400).send({ success: false, msg: "Same subcategory already exists" });
        }
      } else {
        const subCategory = new SubCategory({
          sub_category: req.body.subcategory,
          category_id: req.body.category,
        });
  
        const subcat = await subCategory.save();
  
        console.log(subcat);
  
        res.redirect("subcategory-list");
      }
    } catch (error) {
      console.error(error);
  
      res.status(400).send({ success: false, msg: error.message });
    }
  };
  


  //user side

  exports.subCategorySearch = async (req,res)=>{
  
      const categoryId = req.query.categoryId;
const subcategoryId = req.query.subcategoryId;

Product.find({ category: categoryId, company: subcategoryId })
  .exec()
  .then(products => {
    // Display or process the products as needed
    console.log(products);
    // Render a view or send a response with the products
    res.render('user/subSearchProducts', { products, user: req.session.user });
  })
  .catch(error => {
    console.error(error);
    // Handle the error appropriately
    res.status(500).send('Internal Server Error');
  });
  }
  
