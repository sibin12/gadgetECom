const Address = require('../models/addressSchema')
const Cart = require('../models/cartSchema')
const Order = require('../models/orderSchema')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

// get address page 
exports.getAddress = async (req, res) => {
  let user = req.session.user;
  let userId = req.session.user._id;
  userId = userId.toString();
  console.log(user, "user here");
  const cartCount = req.session.user.count;
  const addressData = await Address.find({ user: user._id });
  if (addressData && addressData.length > 0) {
    const address = addressData[0].address;
    console.log(address, "address got");
    try {
      res.render("user/address", {
        user,
        cartCount,
        address,
      });
    } catch (error) {
      console.log(error);
    };
  } else {
    console.log("No address data found");
    res.render("user/address", {
      user,
      cartCount,
      address: [],
    });
  }
}

// add an address
exports.addAddress = async (req, res) => {
  user = req.session.user._id
  console.log(req.body, "boduyyy")
  const addaddress = {
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    email: req.body.email,
    number: req.body.mobile,
    streetAddress: req.body.address,
    appartment: req.body.appartment,
    town: req.body.town,
    district: req.body.district,
    state: req.body.state,
    pin: req.body.pin
  }

  try {
    let address_data;
    const data = await Address.findOne({ user: user });
    console.log(data, "userid matched")
    if (data) {
      data.address.push(addaddress);
      address_data = await Address.findOneAndUpdate(
        { user: user },
        { $set: { address: data.address } },
        { returnDocument: "after" }
      );
      console.log(address_data.address, "updated address collection");
    } else {
      const address = new Address({
        user: req.session.user._id,
        address: [addaddress],
      });
      address_data = await address.save();
      console.log(address_data, "address collection");
    }

    res.json({ success: true, address: address_data.address });
  } catch (err) {
    console.log(err);
  }
}

// delete an address
exports.deleteAddress = async (req, res) => {
  console.log("deleteing addresss");
  let userId = req.session.user._id
  let addressId = req.params.id
  const result = await Address.updateOne({ user: userId }, { $pull: { address: { _id: new ObjectId(addressId) } } })
  res.json(true)
  console.log(result)
  if (result) {
    console.log("helloooooooooooooooo");
  }
}

// edit an address
exports.editAddress = async (req, res) => {
  try {
    let user = req.session.user;
    const address = await Address.findOne({ "address._id": req.params.id });

    const selectedAddress = address.address.find(
      (addr) => addr._id.toString() === req.params.id
    );
    console.log(selectedAddress, "selectedAddress");
    res.render("user/edit-address", {
      user,
      address: selectedAddress,
    });
  } catch (error) {
    console.log(error);
  }
}

//  update the  address
exports.postEditAddress = async (req, res) => {
  console.log("post edit addresss");
  try {
    console.log("inside try");
    let userId = req.session.user._id
    let addressId = req.params.id

    const user = await Address.find({ user: userId })
    // const address = user.address.findOne((a)=>a._id.toString === addressId)
    const updateAddress = {
      firstName: req.body.firstname,
      lastName: req.body.lastname,
      email: req.body.email,
      number: req.body.mobile,
      streetAddress: req.body.address,
      appartment: req.body.appartment,
      town: req.body.town,
      district: req.body.district,
      state: req.body.state,
      pin: req.body.pin
    }
    const updated_address = await Address.updateOne({ user: userId, "address._id": new ObjectId(addressId) },
      { $set: { "address.$": updateAddress } })
    console.log(updateAddress);

    res.redirect('/address')
  } catch (er) {
    console.log(er);
  }
}
