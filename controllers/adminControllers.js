const Admin = require('../models/adminSchema')
const User = require('../models/userSchema')
const Order = require('../models/orderSchema')
const Product = require('../models/productSchema')
const bcrypt = require('bcrypt')
const path = require('path')
const { orderDetails } = require('./addressController')

// get the admin login page
exports.adminLogin = async (req, res) => {
    try {
        if (req.session.admin) {
            res.redirect('/admin/dashboard')
        } else {
            const adminErr = req.session.adminErr;
            req.session.adminErr = false;
            res.render('admin/admin-login', { other: true, login: adminErr })
        }
    } catch (err) {
        console.log(err);
    }
}

//  verifying the admin credentials
exports.postLogin = async (req, res) => {
    console.log('login check')
    console.log(req.body)
    if (req.session.admin) {
        res.redirect('/admin/dashboard')
    } else {
        try {
            let userName = await Admin.findOne({ email: req.body.email })
            if (userName) {
                bcrypt.compare(req.body.password, userName.password).then((status) => {
                    if (status) {
                        console.log('admin existss')
                        req.session.admin = userName
                        req.session.admin.loggedIn = true
                        // req.session.adminErr = false
                        res.redirect('/admin/dashboard')
                    } else {
                        req.session.adminErr = "invalid password or email"
                        console.log("password error");
                        res.redirect('/admin')
                    }
                })
            } else {
                req.session.adminErr = "invalid password or email"
                console.log("email error");
                res.redirect('/admin')
            }
        } catch (error) {
            console.log(error)
        }
    }
}

// admin logout
exports.adminLogout = (req, res) => {
    req.session.admin = null
    res.redirect('/admin')
}

// get adimin dashboard
exports.dashboard = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate({
                path: 'products.item',
                model: 'Product'
            })
            .exec();
        const totalOrders = orders.length;
        console.log(orders, "orderssssssssssssss");
        const totalQuantity = orders.reduce((acc, order) => {
            order.products.forEach((product) => {
                acc += product.quantity;
            })
            return acc;
        }, 0)
        console.log(totalQuantity, "qyabtitittitit");
        const totalProfit = orders.reduce((acc, order) => {
            return acc + order.totalAmount;
        }, 0)
        console.log(totalProfit, "totalprofit")
        const totalCancelled = orders.reduce((acc, order) => {
            order.products.forEach((product) => {
                if (product.orderstatus === "cancelled") {
                    acc += 1;
                }
            })
            return acc;
        }, 0)
        console.log(totalCancelled, "cancellnumbers")

        const totalShipped = orders.reduce((acc, order) => {
            order.products.forEach((product) => {
                if (product.deliverystatus === "shipped") {
                    acc += 1;
                }
            })
            return acc;
        }, 0)
        console.log(totalShipped, "jjjjjjjjjjjjjj")
        const totalDelivered = orders.reduce((acc, order) => {
            order.products.forEach((product) => {
                if (product.deliverystatus === "delivered") {
                    acc += 1;
                }
            })
            return acc;
        }, 0)
        const totalReturned = orders.reduce((acc, order) => {
            order.products.forEach((product) => {
                if (product.deliverystatus === "returned") {
                    acc += 1;
                }
            })
            return acc;
        }, 0)
        const startOfYear = new Date(new Date().getFullYear(), 0, 1); // start of the year
        const endOfYear = new Date(new Date().getFullYear(), 11, 31); // end of the year

        let orderBasedOnMonths = await Order.aggregate([
            // match orders within the current year
            { $match: { createdAt: { $gte: startOfYear, $lte: endOfYear } } },

            // group orders by month
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    orders: { $push: "$$ROOT" }
                }
            },

            // project the month and orders fields
            {
                $project: {
                    _id: 0,
                    month: "$_id",
                    orders: 1
                }
            },
            {
                $project: {
                    month: 1,
                    orderCount: { $size: "$orders" }
                }
            }
            , {
                $sort: { month: 1 }
            }
        ]);
        res.render('admin/dashboard', { admin: true, totalDelivered, totalReturned, totalOrders, totalQuantity, totalCancelled, totalProfit, totalShipped, orderBasedOnMonths })
    } catch (err) {
        console.log(err);
    }

}

// get the user's list
exports.usersList = async (req, res) => {
    try {
        console.log("admin details");
        let adminDetails = req.session.admin
        console.log(adminDetails);
        const userList = await User.find({})
        res.render('admin/view-users', { userList, admin: true, adminDetails })
    } catch (err) {
        console.log(err)
    }
}

// blocking an existing user
exports.blockUser = async (req, res) => {
    await User.updateOne({ _id: req.params.id }, { isActive: false })
    res.redirect('/admin/view-users')
}

// unblocking and blocked user
exports.unblockUser = async (req, res) => {
    await User.updateOne({ _id: req.params.id }, { isActive: true })
    res.redirect('/admin/view-users')
}

// delete a user
exports.deleteUser = async (req, res) => {
    await User.deleteOne({ _id: req.params.id })
    res.redirect('/admin/view-users')
}

//  get the order details 
exports.viewOrders = async (req, res) => {
    try {
        let orders = await Order.find()
            .populate({ path: 'userId', model: 'User', select: 'name , email' })
            .populate({ path: 'products.item', model: 'Product' })
            .exec()
        res.locals.orders = orders;
        // console.log(orders, "all ordersssssssssssssssssssssssss");
        res.render('admin/view-orders', { admin: true, orders })
    } catch (error) {
        console.log(error);
    }
}

// updating the delivery status 
exports.deliveryStatus = async (req, res) => {
    console.log(req.body, 'selected ')
    let productId = req.query.productId
    let orderId = req.query.orderId;
    console.log(productId, "proId")
    console.log(orderId, "ordId")
    const deliveryStatus = req.body.deliveryStatus;
    console.log(deliveryStatus)
    let orders = await Order.find({ _id: orderId })
        .populate({
            path: 'products.item',
            model: 'Product'
        }).exec();
    console.log(orders, "ord")
    let product = null;
    for (let i = 0; i < orders.length; i++) {
        let order = orders[i];
        product = order.products.find(product => product.item._id.toString() === productId);
        // console.log(product, "products found")
        if (product) {
            if (deliveryStatus == 'cancelled') {
                product.orderstatus = deliveryStatus;
                product.deliverystatus = deliveryStatus;
            } else if (deliveryStatus == 'shipped') {
                product.orderstatus = deliveryStatus;
                product.deliverystatus = deliveryStatus;
            } else if (deliveryStatus == 'returned') {
                product.orderstatus = 'return confirmed'
                product.deliverystatus = 'return confirmed'
            }
            else if (deliveryStatus == 'delivered') {
                product.orderstatus = 'confirmed';
                product.deliverystatus = deliveryStatus;
            }
            await order.save();
            break; // Exit the loop once product is found
        }
    }
    res.redirect('/admin/view-orders')
}

// admin approve of retrun order
exports.approveReturn = async (req, res) => {
    try {
        const { orderId, productId } = req.body;

        // Find the order and product
        const order = await Order.findById(orderId);
        console.log(order, "orderrrrrrrrrrrrrrrrrrrrrrr for retutrnnnnnnnnnnnnnnnnnn");
        const product = order.products.find(p => p.item.toString() === productId);
        console.log(product, "return approvedddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd")
        // Update the order and product status
        product.orderstatus = 'return approved';
        product.deliverystatus = 'return approved';

        await order.save();
        await Product.findOneAndUpdate({ _id: productId }, { $inc: { stockQuantity: 1 } })
        res.json({ success: true, returnStatus: product.deliverystatus })

    } catch (error) {
        console.log(error)
    }
}

// admin reject of the order
exports.rejectReturn = async (req, res) => {
    try {
        const { orderId, productId } = req.body;
        // Find the order and product
        const order = await Order.findById(orderId);
        const product = order.products.find(p => p.item.toString() === productId);
        // Update the order and product status
        product.orderstatus = 'return rejected';
        product.deliverystatus = 'return rejected';
        await order.save();
        res.json({ success: true, returnStatus: product.deliverystatus })
    } catch (error) {
        console.log(error)
    }
}

// get the sales report page
exports.salesReport = async (req, res) => {
    res.render('admin/sales-report', { admin: true })
}

// get the sales report
exports.postSalesReport = async (req, res) => {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    try {
        const orders = await Order.find({
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            }
        })
            .populate('products.item')
            .populate('userId')
            .exec();
        console.log(orders, "orderssssssssssssss");

        const totalSales = orders.length;
        const revenue = orders.reduce((total, order) => {
            return total + order.totalAmount
        }, 0);
        console.log(revenue);

        // Generate the sales report object
        const salesReport = {
            orders,
            totalSales,
            revenue,
            // Add more properties if we want
        };
        console.log(salesReport, "*****************");
        res.json(salesReport);

    } catch (err) {
        console.log(err);
    }
}


