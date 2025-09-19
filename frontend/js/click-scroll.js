//jquery-click-scroll

var sectionArray = [1, 2, 3, 4, 5, 6];

$.each(sectionArray, function(index, value){
    
    // Check if the section exists before setting up scroll listeners
    var sectionElement = $('#' + 'section_' + value);
    if (sectionElement.length === 0) {
        // Section doesn't exist, skip this iteration
        return true; // Continue to next iteration
    }
          
     $(document).scroll(function(){
         var sectionOffset = sectionElement.offset();
         if (!sectionOffset) {
             return; // Exit if offset is undefined
         }
         
         var offsetSection = sectionOffset.top - 90;
         var docScroll = $(document).scrollTop();
         var docScroll1 = docScroll + 1;
         
        
         if ( docScroll1 >= offsetSection ){
             $('.navbar-nav .nav-item .nav-link').removeClass('active');
             $('.navbar-nav .nav-item .nav-link:link').addClass('inactive');  
             $('.navbar-nav .nav-item .nav-link').eq(index).addClass('active');
             $('.navbar-nav .nav-item .nav-link').eq(index).removeClass('inactive');
         }
         
     });
    
    $('.click-scroll').eq(index).click(function(e){
        var clickOffset = sectionElement.offset();
        if (!clickOffset) {
            return; // Exit if offset is undefined
        }
        
        var offsetClick = clickOffset.top - 90;
        e.preventDefault();
        $('html, body').animate({
            'scrollTop':offsetClick
        }, 300)
    });
    
});

$(document).ready(function(){
    $('.navbar-nav .nav-item .nav-link:link').addClass('inactive');    
    $('.navbar-nav .nav-item .nav-link').eq(0).addClass('active');
    $('.navbar-nav .nav-item .nav-link:link').eq(0).removeClass('inactive');
});