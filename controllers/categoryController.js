const Category = require('../models/categorySchema')
const SubCategory = require('../models/subCategorySchema')
const Product = require('../models/productSchema')

exports.categoryList = async (req, res) => {
    let categories = await Category.find({})

    res.render('admin/category-list', { admin: true,categories, categoryErr:req.session.categoryErr })
}
exports.postCategory = async (req,res)=>{
    try {
        console.log("hello")
        const categoryData = await Category.find({})
        console.log(categoryData)
        if(categoryData){
            let check =false
            console.log(req.body.categoryName)
            if (req.body.categoryName && typeof req.body.categoryName === 'string') {
                for (let i = 0; i < categoryData.length; i++) {
                  if (categoryData[i]["categoryName"].toLowerCase() === req.body.categoryName.toLowerCase()) {
                    check = true;
                    // req.session.categoryError =true
                    req.session.categoryErr = "This Category name is already exists"
                    console.log('category exists');
                    console.log(req.session.categoryErr)
                    res.redirect("/admin/category-list")
                    break;
                  }
                }
              } else {
                 req.session.categoryErr = "Category's type is not correct"
                console.log('categoryName is not defined or is not a string');
                res.redirect("/admin/category-list")
              }
              
            if(check ===false){
                req.session.categoryErr = false
                let newCategory = new Category({
                    categoryName:req.body.categoryName  
                })
                await Category.create(newCategory)
                
                res.redirect("/admin/category-list")
            }
        }
    } catch (error) {
        console.log(error)
    }
}
exports.deleteCategory = async(req,res)=>{
    try {
        console.log("finding the category")
        await Category.deleteOne({_id:req.params.id})
        console.log("category deleted")
        res.redirect('/admin/category-list')
    } catch (error) {
     console.log(error);   
    }
    

}

exports.mobile = async (req,res)=>{
    try {
        let user = req.session.user;
        // console.log(products);
      
        const pageNum = parseInt(req.query.page) || 1;
        console.log(pageNum, "selected page");
        const perPage = 4;
        const categoryId = await Category.findOne({ categoryName: "Mobile" }, "_id"); // Assuming "name" is the field that stores the category name
        const totalCount = await Product.countDocuments({
          category: categoryId,
        });
        console.log(totalCount)
      
        const pages = Math.ceil(totalCount / perPage);
      
        // const categoryId = await Category.findOne({ categoryName: "Mobile" }, "_id"); // Assuming "name" is the field that stores the category name
        const products = await Product.find({ category: categoryId })
        .skip((pageNum - 1) * perPage)
        .limit(perPage);
      
        // Access cartCount value from req object
        // const cartCount = req.cartCount;
        console.log(products,"products in the mobile page")
        const categories = await Category.find({})
        console.log(categories,"-----------------------------------------")
        const subcategories = await SubCategory.find({})
        console.log(subcategories,"-----------------------------------------")
         
        res.render("user/mobile", {
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

exports.laptop = async (req,res)=>{
    try {
        let user = req.session.user;
        // console.log(products);
      
        const pageNum = parseInt(req.query.page) || 1;
        console.log(pageNum, "selected page");
        const perPage = 4;
        const categoryId = await Category.findOne({ categoryName: "laptop" }, "_id"); // Assuming "name" is the field that stores the category name
        const totalCount = await Product.countDocuments({
          category: categoryId,
        });
        console.log(totalCount)
      
        const pages = Math.ceil(totalCount / perPage);
      
        const products = await Product.find({ category: categoryId })
        .skip((pageNum - 1) * perPage)
        .limit(perPage);
       
        // Access cartCount value from req object
        // const cartCount = req.cartCount;
        console.log(products,"products in the mobile page")
        const categories = await Category.find({})
        console.log(categories,"-----------------------------------------")
        const subcategories = await SubCategory.find({})
        console.log(subcategories,"-----------------------------------------")
         
        res.render("user/laptop", {
          products,
          categories,
          subcategories,
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