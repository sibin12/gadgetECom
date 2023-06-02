(function ($) {
    "use strict";
    
    // Dropdown on mouse hover
    $(document).ready(function () {
        function toggleNavbarMethod() {
            if ($(window).width() > 992) {
                $('.navbar .dropdown').on('mouseover', function () {
                    $('.dropdown-toggle', this).trigger('click');
                }).on('mouseout', function () {
                    $('.dropdown-toggle', this).trigger('click').blur();
                });
            } else {
                $('.navbar .dropdown').off('mouseover').off('mouseout');
            }
        }
        toggleNavbarMethod();
        $(window).resize(toggleNavbarMethod);
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Vendor carousel
    $('.vendor-carousel').owlCarousel({
        loop: true,
        margin: 29,
        nav: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:2
            },
            576:{
                items:3
            },
            768:{
                items:4
            },
            992:{
                items:5
            },
            1200:{
                items:6
            }
        }
    });


    // Related carousel
    $('.related-carousel').owlCarousel({
        loop: true,
        margin: 29,
        nav: false,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:2
            },
            768:{
                items:3
            },
            992:{
                items:4
            }
        }
    });


    // // Product Quantity
    // $('.increment-button').on('click', function () {
    //     var targetID = $(this).data("target");

    //   // Find the closest quantity display with the matching ID
    //   var quantityDisplay = $("#" + targetID).closest(".value");

    //   // Get the current quantity value and decrement it
    //   var currentValue = parseInt(quantityDisplay.text());
    //   var newValue = currentValue + 1;

    //   // Update the quantity display with the new value
    //   quantityDisplay.text(newValue);
        
        
    // });
    // $(".decrement-button").on( 'click',function() {
    //     // Get the target ID from the data-target attribute
    //     var targetID = $(this).data("target");
  
    //     // Find the closest quantity display with the matching ID
    //     var quantityDisplay = $("#" + targetID).closest(".value");
          
    //     // Get the current quantity value and decrement it
    //     var currentValue = parseInt(quantityDisplay.text());
    //     var newValue;
    //     currentValue > 1 ? newValue = currentValue - 1: newValue = currentValue;
  
    //     // Update the quantity display with the new value
    //     quantityDisplay.text(newValue);
    //   });
    
})(jQuery);


function goBack() {
window.history.back();
}

function goNext() {
window.history.forward();
}
window.addEventListener("load", function() {
var previousArrow = document.getElementById("previousArrow");
var nextArrow = document.getElementById("nextArrow");


if (!window.history.back) {
previousArrow.classList.add("hidden");
}

if (!window.history.forward) {
nextArrow.classList.add("hidden");
}
});


