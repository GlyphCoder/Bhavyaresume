// jQuery ready function
$(document).ready(function() {
    // Fix for page refresh - scroll to top when page loads
    if (window.location.hash) {
        // Remove hash from URL without scrolling
        history.replaceState(null, null, '');
        // Scroll to top of page
        window.scrollTo(0, 0);
    }
    
    // Initialize AOS with better settings
    AOS.init({
        duration: 1200,
        once: false,
        mirror: true,
        offset: 50,
        delay: 0,
        easing: 'ease-out-cubic'
    });

    // Optimized spotlight effect with requestAnimationFrame
    let spotlightX = 0, spotlightY = 0;
    let ticking = false;
    
    $(document).mousemove(function(e) {
        spotlightX = e.clientX;
        spotlightY = e.clientY;
        
        if (!ticking) {
            requestAnimationFrame(function() {
                $('.spotlight').css({
                    'left': spotlightX + 'px',
                    'top': spotlightY + 'px'
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    // Smooth scrolling when clicking on hero title
    $('.hero-content h1').click(function() {
        $('html, body').animate({
            scrollTop: $('.about-section').offset().top - 70
        }, 1000);
    });

    // Enhanced hover effects for glass cards
    $('.glass-card').hover(
        function() {
            $(this).addClass('hovered');
        },
        function() {
            $(this).removeClass('hovered');
        }
    );

    // Add click animation to download button
    $('.download-resume').click(function() {
        $(this).animate({ 
            transform: 'scale(0.95)' 
        }, 100).animate({ 
            transform: 'scale(1)' 
        }, 100);
    });
    
    // Add click animation to contact button
    $('.contact-me').click(function() {
        $(this).animate({ 
            transform: 'scale(0.95)' 
        }, 100).animate({ 
            transform: 'scale(1)' 
        }, 100);
    });
});

// Additional fix for page refresh issue
window.addEventListener('load', function() {
    if (window.location.hash) {
        // Remove the hash from the URL
        history.replaceState(null, null, '');
        // Scroll to top
        window.scrollTo(0, 0);
    }
});
