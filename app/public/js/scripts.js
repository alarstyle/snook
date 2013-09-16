(function($){

    var loadedImages = [],
        loadingUrl,
        totalImages = 0,
        currentImage = 0;

    var $thumbsContainer,
        $thumbs,
        $controlPages,
        $controlNext,
        $controlPrev,
        $controlThumbs,
        $preloader,
        $views = $('');

    function checkModernizr() {
        //Modernizr.canvas
        //Modernizr.draganddrop
        //Modernizr.cssanimations
        //Modernizr.csstransforms
        //Modernizr.csstransforms3d
        //Modernizr.csstransitions
        //Modernizr.touch
    }

    function init() {

        $thumbsContainer = $('.thumbs');
        $thumbs = $('.thumbs .item');
        $controlPages = $('.control-pages');
        $controlNext = $('.control .btn_next');
        $controlPrev = $('.control .btn_prev');
        $controlThumbs = $('.control .btn_thumbs');
        $preloader = $('.preloader');

        totalImages = $thumbs.length;

        $thumbs.each(function(i) {
            $(this).data('number', i);
            $(this).data('url', $(this).attr('href'));
            $views = $views.add('<div class="item"></div>');
        });

        $thumbs.click(function(e) {
            e.preventDefault();
            currentImage = $(this).data('number');
            loadImage();
        });

        $controlNext.click(function(e) {
            e.preventDefault();
            showNext();
        });

        $controlPrev.click(function(e) {
            e.preventDefault();
            showPrev();
        });

        $controlThumbs.click(function(e) {
            e.preventDefault();
            toggleThumbs();
        });

        $thumbs.eq(0).click();
    }

    function loadImage() {
        var localCurrentImage = currentImage;
        $thumbs.removeClass('active');
        $thumbs.eq(currentImage).addClass('active');
        if ($views.eq(localCurrentImage).data('complete')) {
            showImage();
            return;
        }
        showPreloader();
        $('<img src="'+ $thumbs.eq(localCurrentImage).data('url') +'">').load(function() {
            var $item = $views.eq(localCurrentImage).append(this).appendTo('.view-inner');
            $views.eq(localCurrentImage).data('complete', true);
            if (localCurrentImage === currentImage) {
                showImage();
            }
        });
    }

    function showImage() {
        hidePreloader();
        $controlPages.text((currentImage+1) + '/' + totalImages);
        console.log($views.find('.active').length);
        $views.removeClass('active');
        $views.eq(currentImage).addClass('active');
    }

    function showPreloader() {
        $preloader.addClass('visible');
    }
    function hidePreloader() {
        $preloader.removeClass('visible');
    }

    function showNext() {
        if (currentImage >= totalImages - 1) return;
        currentImage += 1;
        loadImage();
    }
    function showPrev() {
        if (currentImage <= 0) return;
        currentImage -= 1;
        loadImage();
    }

    function toggleThumbs() {
        $thumbsContainer.toggleClass('visible');
    }

	$(document).ready(function() {
        checkModernizr();
        init();
	});

	$(window).load(function(){

	});
	
})(jQuery);