function calculateOffer(mrp, price) {
    var discountPercentage = ((mrp - price) / mrp) * 100;
    return Math.round(discountPercentage * 100) / 100;
  }
  