
  (function ($) {
  
  "use strict";

    // COUNTER NUMBERS - Simple fallback for .appear() plugin
    if (typeof jQuery.fn.appear === 'undefined') {
      // Simple fallback - just trigger counter animation on page load
      jQuery(document).ready(function() {
        if (jQuery('.counter-number').length > 0) {
          // Use the counter.js animation instead
          console.log('Counter elements found, using counter.js animation');
        }
      });
    } else {
      jQuery('.counter-thumb').appear(function() {
        jQuery('.counter-number').countTo();
      });
    }
    
    // CUSTOM LINK
    $('.smoothscroll').click(function(){
    var el = $(this).attr('href');
    var elWrapped = $(el);
    var header_height = $('.navbar').height();

    scrollToDiv(elWrapped,header_height);
    return false;

    function scrollToDiv(element,navheight){
      var offset = element.offset();
      var offsetTop = offset.top;
      var totalScroll = offsetTop-navheight;

      $('body,html').animate({
      scrollTop: totalScroll
      }, 300);
    }
});
    
  })(window.jQuery);