// is browser IE8 or lower
var isLteIe8 = (navigator.appVersion.indexOf("MSIE 6.")!=-1 || navigator.appVersion.indexOf("MSIE 7.")!=-1 || navigator.appVersion.indexOf("MSIE 8.")!=-1) ? true : false;

// Prevent smartphone scroll
try {
    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
}
catch (e) {}

(function($){

    // add class if IE8 or lower
    if (isLteIe8) {
        $('html').addClass('lteie8');
    }

    var loadedImages = [],
        loadingUrl,
        totalImages = 0,
        currentImage = 0;

    var $thumbsContainer,
        $thumbsFloat,
        $thumbsWidth,
        $thumbs,
        $controlPages,
        $controlNext,
        $controlPrev,
        $controlThumbs,
        $preloader,
        $viewInner,
        $views = $('');

    var viewScroll,
        thumbsScroll;

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

        $thumbsContainer    = $('.thumbs');
        $thumbsFloat        = $('.thumbs .float');
        $thumbsWidth        = $('.thumbs-width');
        $thumbs             = $('.thumbs .item');
        $controlPages       = $('.control-pages');
        $controlNext        = $('.control .btn_next');
        $controlPrev        = $('.control .btn_prev');
        $controlThumbs      = $('.control .btn_thumbs');
        $preloader          = $('.preloader');
        $viewInner          = $('.view-inner');

        totalImages = $thumbs.length;

        $thumbsFloat.width($thumbsWidth.width());

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

    function updateThumbs() {
        $thumbs.removeClass('active');
        $thumbs.eq(currentImage).addClass('active');
        console.log($thumbsFloat.offset());
        //if (thumbsScroll) thumbsScroll.scrollTo(-$thumbs.eq(currentImage).offset().left, 0, 100);
        if (thumbsScroll) thumbsScroll.scrollToElement($thumbs[currentImage], 1000, true, true);

    }

    function loadImage() {
        var localCurrentImage = currentImage;
        updateThumbs();
        if ($views.eq(localCurrentImage).data('complete')) {
            showImage();
            return;
        }
        showPreloader();
        $('<img src="'+ $thumbs.eq(localCurrentImage).data('url') +'">').load(function() {
            var $item = $views.eq(localCurrentImage).append(this).appendTo($viewInner);
            $views.eq(localCurrentImage).data('complete', true);
            $views.eq(localCurrentImage).data('width', this.width);
            $views.eq(localCurrentImage).data('height', this.height);
            if (localCurrentImage === currentImage) {
                showImage();
            }
        });
    }

    function showImage() {
        var $currentView = $views.eq(currentImage);
        hidePreloader();
        $controlPages.text((currentImage+1) + '/' + totalImages);
        console.log($views.find('.active').length);
        $views.removeClass('active');
        $currentView.addClass('active');/*
        $viewInner.width($currentView.data('width'));
        $viewInner.height($currentView.data('height'));
        $viewInner.width($currentView.data('width'));*/
        /*$currentView.css({
            'width': $currentView.data('width'),
            'height': $currentView.data('height'),
            'margin-top': -$currentView.data('height')/2,
            'margin-left': -$currentView.data('width')/2
        });*/
        resetScroll();
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

    function initScroll() {
        function onZoomEnd() {
            console.log($viewInner.width());
        }/*
        viewScroll = new IScroll('.view', {
            zoom: true,
            zoomMin: 0.1,
            zoomMax: 2,
            scrollX: true,
            scrollY: true,
            mouseWheel: true,
            wheelAction: 'zoom',
            scrollbars: true,
            interactiveScrollbars: true
        });
        thumbsScroll = new IScroll('.thumbs-inner', {
            scrollX: true,
            scrollY: false,
            mouseWheel: true,
            scrollbars: true,
            interactiveScrollbars: true,
            scrollbars: 'custom'
        });
        viewScroll.on('zoomEnd', onZoomEnd)*/;
        var $thumbs_inner = $('.thumbs-inner')
        thumbsScroll = new iScroll($thumbs_inner[0], {
            bounce: false,
            vScroll: false
        });
    }

    function resetScroll() {
        /*viewScroll.refresh();
        viewScroll.zoom(1,0,0,0);
        viewScroll.scrollTo(0,0);*/
        thumbsScroll.refresh();
    }

	$(document).ready(function() {
        checkModernizr();
        init();
        initScroll();
    });

	$(window).load(function(){

	});
	
})(jQuery);