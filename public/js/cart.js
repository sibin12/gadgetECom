function addToCart(proId ,stock) {
    if(stock == 0){
        toastr.info('The Product is out of Stock ,you can add it to wishlist', 'info', {
                        timeOut: 3000,
                        progressBar: true,
                        closeButton: true
                    });
                    return;
      }else {
    $.ajax({
        url: `/addToCart/${proId}`,
        method: 'get',
        success: (response) => {
            if(response.success === true){
            // alert(response)
          
            let count = $('#cartCount').html()
            count = parseInt(count) + 1
            $('#cartCount').html(count)
            $('#cartCount1').html(count)
            // document.getElementById("stockQuantity").innerHTML = `${response.stock} items left in stock`

            const stockQuantityElement = document.getElementById(`stockQuantity_${proId}`);
            if (stockQuantityElement) {
              stockQuantityElement.textContent = `${response.stock} items left in stock`;
            }

            console.log(typeof (count))
            console.log(count, 'countttt')

            toastr.success('Product added successfully to the cart.', 'Success', {
                timeOut: 3000, // time in ms
                progressBar: true, // show a progress bar
                closeButton: true, // show a close button
            });
        }else{
            toastr.info('First you need to login for add the product to the cart.', 'info', {
                    timeOut: 3000,
                    progressBar: true,
                    closeButton: true
                });
        }
    }
    })
}
}

function addToWishlist(event,proId) {
    event.preventDefault()
    $.ajax({
        url: `/addToWishlist/${proId}`,
        method: 'get',
        success: (response) => {

            if (response.success == true ) {
                // toastr.info('Product is added')
                 toastr.success('Product added successfully to the WishList.', 'Success', {
                    timeOut: 3000, // time in ms
                    progressBar: true, // show a progress bar
                    closeButton: true, // show a close button
                });

                let wishListCount = $('#wishListCount').html()
                count = parseInt(wishListCount) + 1
                $('#wishListCount').html(count)
                $('#wishListCount1').html(count)

                // toastr.success('Product added successfully to the WishList.', 'Success', {
                //     timeOut: 3000, // time in ms
                //     progressBar: true, // show a progress bar
                //     closeButton: true, // show a close button
                // });
            } else if(response.success === false) {
                toastr.info('The Product is Already in your Wishlist.', 'Error', {
                    timeOut: 3000,
                    progressBar: true,
                    closeButton: true
                });
            }

             else if(response.login === true){
                toastr.info('First you need to Login for adding the product to the Wishlist.', 'info', {
                timeOut: 3000,
                progressBar: true,
                closeButton: true
            });
            }

        },
        error: (error) => {
            console.log(error);
            toastr.error('An error occured in adding the product to the Wishlist.', 'Error', {
                timeOut: 3000,
                progressBar: true,
                closeButton: true
            });
        }
    });
}
