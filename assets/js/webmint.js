(function ($) {
    "use strict";

    $(document).ready(function () {

        var $window = $(window);
        var $document = $(document);

        var $header = $("#site-header");
        var $heroVisual = $("#wm-hero-visual");
        var $ecosystemWindow = $(".wm-ecosystem-window");

        var $navigation = $("#navigation");
        var $navigationLinks = $("#navigation a");

        var $backTop = $("#back-top");
        var $preloader = $("#preloader-active");

        var headerOffset = 95;

        var supportsReducedMotion =
            window.matchMedia &&
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;


        /* =====================================================
           PRELOADER
        ===================================================== */

        function hidePreloader() {

            if (!$preloader.length) {
                return;
            }

            $preloader
                .stop(true, true)
                .fadeOut(350);

            $("body").css(
                "overflow",
                "visible"
            );
        }


        $window.on(
            "load",
            hidePreloader
        );


        /*
         * Safety fallback:
         * Never allow preloader to block website indefinitely.
         */
        window.setTimeout(
            hidePreloader,
            2500
        );


        /* =====================================================
           MOBILE NAVIGATION
        ===================================================== */

        function initializeMobileNavigation() {

            if (
                !$navigation.length ||
                typeof $.fn.slicknav !== "function"
            ) {
                return;
            }

            /*
             * Avoid duplicate SlickNav initialization.
             */
            if (
                $(".slicknav_menu").length
            ) {
                return;
            }

            $navigation.slicknav({

                prependTo: ".mobile_menu",

                label: "",

                closedSymbol: "+",

                openedSymbol: "-",

                allowParentLinks: true

            });
        }


        initializeMobileNavigation();


        /* =====================================================
           HEADER SCROLL STATE
        ===================================================== */

        function updateHeaderState() {

            if (!$header.length) {
                return;
            }

            if (
                $window.scrollTop() > 30
            ) {

                $header.addClass(
                    "wm-header-scrolled"
                );

            } else {

                $header.removeClass(
                    "wm-header-scrolled"
                );

            }

        }


        /* =====================================================
           BACK TO TOP
        ===================================================== */

        function updateBackToTop() {

    if (!$backTop.length) {
        return;
    }

    var shouldShow =
        window.pageYOffset > 400;

    $backTop.toggleClass(
        "wm-back-top-visible",
        shouldShow
    );

}


        /* =====================================================
           ACTIVE NAVIGATION
        ===================================================== */

      var activeNavigationId = "";

function updateActiveNavigation() {

    if (!$navigationLinks.length) {
        return;
    }

    var scrollPosition =
        window.pageYOffset + 150;

    var activeSectionId =
        "home";

    $navigationLinks.each(
        function () {

            var href =
                this.getAttribute("href");

            if (
                !href ||
                href.charAt(0) !== "#"
            ) {
                return;
            }

            var section =
                document.getElementById(
                    href.substring(1)
                );

            if (!section) {
                return;
            }

            var sectionTop =
                section.offsetTop;

            var sectionBottom =
                sectionTop +
                section.offsetHeight;

            if (
                scrollPosition >= sectionTop &&
                scrollPosition < sectionBottom
            ) {
                activeSectionId =
                    href.substring(1);

                return false;
            }

        }
    );

    /*
     * DOM classes only update when
     * active section actually changes.
     */
    if (
        activeNavigationId ===
        activeSectionId
    ) {
        return;
    }

    activeNavigationId =
        activeSectionId;

    $navigationLinks
        .removeClass("active")
        .filter(
            '[href="#' +
            activeSectionId +
            '"]'
        )
        .addClass("active");

    $(".slicknav_nav a")
        .removeClass("active")
        .filter(
            '[href="#' +
            activeSectionId +
            '"]'
        )
        .addClass("active");

}

        /* =====================================================
           SMOOTH INTERNAL NAVIGATION
        ===================================================== */

        $document.on(
            "click",
            'a[href^="#"]',
            function (event) {

                var targetId =
                    $(this).attr("href");


                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                var $target =
                    $(targetId);


                if (!$target.length) {
                    return;
                }


                event.preventDefault();


                var targetPosition =
                    Math.max(
                        0,
                        $target.offset().top -
                        headerOffset
                    );


                window.scrollTo({
    top: targetPosition,
    behavior:
        supportsReducedMotion
            ? "auto"
            : "smooth"
});


                /*
                 * Close mobile menu after selecting link.
                 */
                if (
                    $(this)
                        .closest(".slicknav_nav")
                        .length
                ) {

                    var $button =
                        $(".slicknav_btn");


                    if (
                        $button.length &&
                        !$button.hasClass(
                            "slicknav_collapsed"
                        )
                    ) {

                        $button.trigger(
                            "click"
                        );

                    }

                }

            }
        );


        /* =====================================================
           HERO 3D INTERACTION
        ===================================================== */

        if (
            $heroVisual.length &&
            $ecosystemWindow.length &&
            !supportsReducedMotion
        ) {

            $heroVisual.on(
                "mousemove",
                function (event) {

                    if (
                        $window.width() < 992
                    ) {
                        return;
                    }


                    var visualOffset =
                        $heroVisual.offset();

                    var visualWidth =
                        $heroVisual.outerWidth();

                    var visualHeight =
                        $heroVisual.outerHeight();


                    if (
                        !visualWidth ||
                        !visualHeight
                    ) {
                        return;
                    }


                    var mouseX =
                        event.pageX -
                        visualOffset.left;

                    var mouseY =
                        event.pageY -
                        visualOffset.top;


                    var rotateY =
                        (
                            (
                                mouseX /
                                visualWidth
                            ) -
                            0.5
                        ) * 8;


                    var rotateX =
                        (
                            (
                                mouseY /
                                visualHeight
                            ) -
                            0.5
                        ) * -6;


                    $ecosystemWindow.css(
                        "transform",

                        "rotateY(" +
                        rotateY +
                        "deg) " +

                        "rotateX(" +
                        rotateX +
                        "deg) " +

                        "translateY(-3px)"
                    );

                }
            );


            $heroVisual.on(
                "mouseleave",

                function () {

                    $ecosystemWindow.css(
                        "transform",

                        "rotateY(-4deg) " +
                        "rotateX(2deg)"
                    );

                }

            );

        }


        /* =====================================================
           SCROLL REVEAL
        ===================================================== */

        function initializeRevealAnimations() {

            /*
             * Reveal animations are owned by webmint-motion.js.
             * Do not initialize WOW here, otherwise both systems animate
             * the same elements and cause transform/visibility conflicts.
             */
            var $revealElements = $(".webmint-reveal");

            if (supportsReducedMotion) {
                $revealElements.css({
                    visibility: "visible",
                    animation: "none"
                });
            }
        }

        initializeRevealAnimations();


        /* =====================================================
           CURRENT FOOTER YEAR
        ===================================================== */

        var currentYearElement =
            document.getElementById(
                "current-year"
            );


        if (currentYearElement) {

            currentYearElement.textContent =
                new Date().getFullYear();

        }


        /* =====================================================
           OPTIMIZED SCROLL HANDLER
        ===================================================== */

        var scrollTicking =
            false;


        function handleScroll() {

            updateHeaderState();

            updateBackToTop();

            updateActiveNavigation();

            scrollTicking =
                false;

        }


        $window.on(
            "scroll",

            function () {

                if (scrollTicking) {
                    return;
                }


                scrollTicking =
                    true;


                window.requestAnimationFrame(
                    handleScroll
                );

            }

        );


        /* =====================================================
           RESIZE HANDLER
        ===================================================== */

        var resizeTimer;


        $window.on(
            "resize",

            function () {

                window.clearTimeout(
                    resizeTimer
                );


                resizeTimer =
                    window.setTimeout(
                        function () {

                            updateHeaderState();

                            updateActiveNavigation();


                            if (
                                $window.width() <
                                    992 &&
                                $ecosystemWindow.length
                            ) {

                                $ecosystemWindow.css(
                                    "transform",
                                    "none"
                                );

                            }

                        },

                        120
                    );

            }

        );


        /* =====================================================
           INITIAL STATE
        ===================================================== */

        updateHeaderState();

        updateBackToTop();

        updateActiveNavigation();

    });

})(jQuery);


// ==========================================================
// DEVELOPMENT PROCESS — 01 → 06 SCROLL JOURNEY
// ==========================================================

(function () {

    const section =
        document.querySelector(
            ".wm-process-section"
        );

    if (!section) return;


    const timeline =
        section.querySelector(
            ".wm-process-timeline"
        );


    const steps =
        Array.from(
            section.querySelectorAll(
                ".wm-process-step"
            )
        );


    if (
        !timeline ||
        !steps.length
    ) {
        return;
    }


    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (reducedMotion) {

        steps.forEach(
            step =>
                step.classList.add(
                    "is-active"
                )
        );

        timeline.setAttribute(
            "data-flow-step",
            "5"
        );

        return;
    }


    let ticking = false;


    function updateProcessFlow() {

        ticking = false;


        const rect =
            section.getBoundingClientRect();


        const viewportHeight =
            window.innerHeight;


        /*
         * Animation starts when process section
         * enters lower part of viewport.
         */

        const startPoint =
            viewportHeight * 0.78;


        const endPoint =
            viewportHeight * 0.30;


        const animationDistance =
            Math.max(
                1,
                section.offsetHeight +
                startPoint -
                endPoint
            );


        const travelled =
            startPoint -
            rect.top;


        let progress =
            travelled /
            animationDistance;


        progress =
            Math.max(
                0,
                Math.min(
                    1,
                    progress
                )
            );


        /*
         * Convert scroll progress:
         *
         * 0 = Discover
         * 1 = Plan
         * 2 = Design
         * 3 = Develop
         * 4 = Test
         * 5 = Deploy
         */

        let currentStep =
            Math.floor(
                progress *
                steps.length
            );


        currentStep =
            Math.min(
                steps.length - 1,
                Math.max(
                    0,
                    currentStep
                )
            );


        /*
         * Before section enters viewport
         */

        if (
            rect.top >
            startPoint
        ) {

            timeline.removeAttribute(
                "data-flow-step"
            );

            steps.forEach(
                step =>
                    step.classList.remove(
                        "is-active"
                    )
            );

            return;
        }


        timeline.setAttribute(
            "data-flow-step",
            String(
                currentStep
            )
        );


        steps.forEach(
            (
                step,
                index
            ) => {

                step.classList.toggle(
                    "is-active",

                    index <=
                    currentStep
                );

            }
        );

    }


    function requestUpdate() {

        if (ticking) return;


        ticking = true;


        window.requestAnimationFrame(
            updateProcessFlow
        );

    }


    window.addEventListener(
        "scroll",
        requestUpdate,
        {
            passive: true
        }
    );


    window.addEventListener(
        "resize",
        requestUpdate
    );


    updateProcessFlow();

})();