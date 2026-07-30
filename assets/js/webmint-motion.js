(function () {
    "use strict";

    var doc = document;
    var root = doc.documentElement;
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    var mobileQuery = window.matchMedia ? window.matchMedia("(max-width: 767px)") : { matches: false };

    root.classList.add("js");

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function toArray(list) {
        return Array.prototype.slice.call(list || []);
    }

    function observeOnce(elements, onEnter, options) {
        elements = toArray(elements);
        if (!elements.length) return;

        if (reducedMotion || !("IntersectionObserver" in window)) {
            elements.forEach(function (el, index) { onEnter(el, index); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                onEnter(entry.target, elements.indexOf(entry.target));
                observer.unobserve(entry.target);
            });
        }, options || { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });

        elements.forEach(function (el) { observer.observe(el); });
    }

    function revealElement(el) {
        el.classList.add("is-visible");
    }

    if (reducedMotion) {
        root.classList.add("wm-reduced-motion");
        toArray(doc.querySelectorAll(".webmint-reveal")).forEach(function (el) {
            el.classList.add("wm-motion-reveal", "is-visible");
            el.style.visibility = "visible";
        });
        return;
    }

    root.classList.add("wm-motion-enabled");

    /* HERO: one entrance only + extremely subtle continuous float. */
    (function initHero() {
        var hero = doc.querySelector(".wm-hero");
        if (!hero) return;

        var background = hero.querySelector(".wm-hero-background");
        if (background && background.querySelectorAll(".wm-hero-glow").length < 3) {
            var thirdGlow = doc.createElement("span");
            thirdGlow.className = "wm-hero-glow wm-hero-glow-three";
            background.appendChild(thirdGlow);
        }

        var title = hero.querySelector(".wm-hero-title");
        var description = hero.querySelector(".wm-hero-description");
        var actions = hero.querySelector(".wm-hero-actions");
        var visual = hero.querySelector(".wm-hero-visual");

        if (title) title.classList.add("wm-hero-motion-title");
        if (description) description.classList.add("wm-hero-motion-description");
        if (actions) actions.classList.add("wm-hero-motion-actions");
        if (visual) visual.classList.add("wm-hero-motion-visual");

        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                hero.classList.add("wm-hero-motion-in");
            });
        });
    })();

    /* =========================================================
   HERO PREMIUM DEPTH INTERACTION
   Smooth cursor glow + restrained multi-layer parallax
========================================================= */

(function initHeroDepthMotion() {

    var hero =
        doc.querySelector(".wm-hero");

    if (!hero) return;


    var glow =
        doc.getElementById(
            "wm-hero-cursor-glow"
        );


    var aurora =
        hero.querySelector(
            ".wm-hero-aurora"
        );


    var perspectiveGrid =
        hero.querySelector(
            ".wm-hero-perspective-grid"
        );


    /*
     * Disable pointer interaction on touch devices.
     */

    if (coarsePointer) {

        return;

    }


    var targetX = 0;
    var targetY = 0;

    var currentX = 0;
    var currentY = 0;

    var cursorX = -1000;
    var cursorY = -1000;

    var currentCursorX = -1000;
    var currentCursorY = -1000;

    var active = false;


    /* -----------------------------------------------------
       POINTER TARGET
    ----------------------------------------------------- */

    hero.addEventListener(
        "pointermove",
        function (event) {

            var rect =
                hero.getBoundingClientRect();


            cursorX =
                event.clientX -
                rect.left;

            cursorY =
                event.clientY -
                rect.top;


            /*
             * Normalized range:
             *
             * -1 = left/top
             *  0 = center
             * +1 = right/bottom
             */

            targetX =
                (
                    cursorX /
                    rect.width -
                    0.5
                ) * 2;


            targetY =
                (
                    cursorY /
                    rect.height -
                    0.5
                ) * 2;


            active = true;

        },
        {
            passive: true
        }
    );


    hero.addEventListener(
        "pointerleave",
        function () {

            targetX = 0;
            targetY = 0;

            active = false;

        },
        {
            passive: true
        }
    );


    /* -----------------------------------------------------
       SMOOTH RENDER LOOP
    ----------------------------------------------------- */

    function renderDepthMotion() {


        /*
         * Smooth interpolation prevents background
         * from directly snapping to mouse.
         */

        currentX +=
            (
                targetX -
                currentX
            ) * 0.035;


        currentY +=
            (
                targetY -
                currentY
            ) * 0.035;


        currentCursorX +=
            (
                cursorX -
                currentCursorX
            ) * 0.095;


        currentCursorY +=
            (
                cursorY -
                currentCursorY
            ) * 0.095;


        /* ---------------------------------------------
           CURSOR LIGHT
        --------------------------------------------- */

        if (glow) {

            glow.style.setProperty(
                "--wm-cursor-x",
                currentCursorX + "px"
            );

            glow.style.setProperty(
                "--wm-cursor-y",
                currentCursorY + "px"
            );

        }


        /* ---------------------------------------------
           AURORA — FAR BACKGROUND
           Moves opposite cursor extremely slowly.
        --------------------------------------------- */

        if (aurora) {

            aurora.style.setProperty(
                "--wm-parallax-x",
                (
                    currentX *
                    -12
                ) + "px"
            );

            aurora.style.setProperty(
                "--wm-parallax-y",
                (
                    currentY *
                    -8
                ) + "px"
            );

        }


        /* ---------------------------------------------
           GRID — DIFFERENT DEPTH SPEED
        --------------------------------------------- */

        if (perspectiveGrid) {

            perspectiveGrid.style.setProperty(
                "--wm-grid-parallax-x",
                (
                    currentX *
                    9
                ) + "px"
            );

            perspectiveGrid.style.setProperty(
                "--wm-grid-parallax-y",
                (
                    currentY *
                    5
                ) + "px"
            );

        }


        window.requestAnimationFrame(
            renderDepthMotion
        );

    }


    window.requestAnimationFrame(
        renderDepthMotion
    );

})();

    /* Generic one-time reveals for every existing reveal element except hero. */
    (function initGlobalReveals() {
        var all = toArray(doc.querySelectorAll(".webmint-reveal")).filter(function (el) {
            return !el.closest(".wm-hero");
        });

        all.forEach(function (el) {
            el.classList.remove("wow", "fadeInUp", "animated");
            el.style.visibility = "visible";
            el.style.animationName = "none";
            el.classList.add("wm-motion-reveal");
            if (!el.hasAttribute("data-motion")) el.setAttribute("data-motion", "up");
        });

        /* Section-specific stagger values. */
        [
            [".wm-products-grid > *", 85, "up"],
            [".wm-custom-services-grid > *", 75, "scale"],
            [".wm-why-feature-grid > *", 80, "up"],
            [".wm-industries-grid > *", 80, "up"],
            [".wm-about-feature-grid > *", 75, "up"]
        ].forEach(function (config) {
            toArray(doc.querySelectorAll(config[0])).forEach(function (el, index) {
                el.setAttribute("data-motion", mobileQuery.matches ? "up" : config[2]);
                el.style.setProperty("--wm-reveal-delay", (index * config[1]) + "ms");
            });
        });

        observeOnce(all, revealElement, { threshold: 0.07, rootMargin: "0px 0px -3% 0px" });
    })();

    /* Featured product: opposite direction desktop, fade-up mobile. */
    (function initFeaturedProduct() {
        var section = doc.querySelector("#featured-product");
        if (!section) return;

        var visual = section.querySelector(".featured-product-visual");
        var copy = section.querySelector(".featured-product-copy");
        var bullets = toArray(section.querySelectorAll(".feature-list-grid > *"));

        if (visual) visual.setAttribute("data-motion", mobileQuery.matches ? "up" : "left");
        if (copy) copy.setAttribute("data-motion", mobileQuery.matches ? "up" : "right");

        bullets.forEach(function (el, index) {
            el.classList.add("wm-motion-bullet");
            el.style.setProperty("--wm-bullet-delay", (120 + index * 70) + "ms");
        });

        observeOnce([copy].filter(Boolean), function () {
            bullets.forEach(function (bullet) { bullet.classList.add("is-visible"); });
        }, { threshold: 0.16 });
    })();

    /* About visual gets zoom-to-normal, text remains fade-up. */
    (function initAbout() {
        var visual = doc.querySelector(".wm-about-main-visual");
        if (!visual) return;
        visual.classList.add("wm-motion-reveal", "wm-about-zoom-reveal");
        visual.setAttribute("data-motion", mobileQuery.matches ? "up" : "zoom");
        visual.style.visibility = "visible";
        observeOnce([visual], revealElement, { threshold: 0.12 });
    })();

    /* Semantic number counters, one time only. */
    (function initCounters() {
        var candidates = toArray(doc.querySelectorAll("[data-count],[data-target],.wm-stat-number,.wm-metric-number,.wm-counter"));
        candidates = candidates.filter(function (el) {
            var explicit = el.getAttribute("data-count") || el.getAttribute("data-target");
            var text = (explicit || el.textContent || "").trim().replace(/,/g, "");
            return /^\d+(\.\d+)?[+%KkMm]?$/.test(text);
        });

        function animateCounter(el) {
            if (el.dataset.wmCounted === "true") return;
            el.dataset.wmCounted = "true";
            var raw = (el.getAttribute("data-count") || el.getAttribute("data-target") || el.textContent).trim();
            var suffixMatch = raw.match(/[+%KkMm]+$/);
            var suffix = suffixMatch ? suffixMatch[0] : "";
            var numeric = parseFloat(raw.replace(/,/g, "").replace(/[+%KkMm]+$/, ""));
            if (!isFinite(numeric)) return;
            var start = performance.now();
            var duration = 900;
            function frame(now) {
                var p = clamp((now - start) / duration, 0, 1);
                var value = numeric * (1 - Math.pow(1 - p, 3));
                el.textContent = Math.round(value) + suffix;
                if (p < 1) window.requestAnimationFrame(frame);
                else el.textContent = numeric + suffix;
            }
            window.requestAnimationFrame(frame);
        }
        observeOnce(candidates, animateCounter, { threshold: 0.4 });
    })();

    /* Development process: scroll-linked line and step activation. */
    (function initProcessTimeline() {
        var section = doc.querySelector(".wm-process-section");
        if (!section) return;
        var timeline = section.querySelector(".wm-process-timeline");
        var progress = section.querySelector(".wm-process-line-progress");
        var steps = toArray(section.querySelectorAll(".wm-process-step"));
        if (!timeline || !steps.length) return;

        var mobileLine = doc.createElement("span");
        mobileLine.className = "wm-process-mobile-progress";
        mobileLine.setAttribute("aria-hidden", "true");
        timeline.appendChild(mobileLine);

        var ticking = false;
        function update() {
            ticking = false;
            var rect = timeline.getBoundingClientRect();
            var startPoint = window.innerHeight * 0.78;
            var endPoint = window.innerHeight * 0.30;
            var distance = Math.max(1, rect.height + startPoint - endPoint);
            var p = clamp((startPoint - rect.top) / distance, 0, 1);

            if (progress) progress.style.transform = "scaleX(" + p.toFixed(4) + ")";
            mobileLine.style.transform = "scaleY(" + p.toFixed(4) + ")";

            steps.forEach(function (step) {
                var stepRect = step.getBoundingClientRect();
                step.classList.toggle("is-process-active", stepRect.top < window.innerHeight * 0.72);
            });
        }
        function requestUpdate() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(update);
        }
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate, { passive: true });
        update();
    })();

    /* Final CTA: one reveal and one entrance pulse. */
    (function initFinalCta() {
        var section = doc.querySelector(".wm-final-cta");
        if (!section) return;
        var box = section.querySelector(".wm-final-cta-box");
        var heading = section.querySelector("h2, h3");
        var primary = section.querySelector(".wm-final-cta-button-primary");
        if (box) box.classList.add("wm-final-motion-ready");
        if (heading) heading.classList.add("wm-final-heading-motion");
        if (primary) primary.classList.add("wm-final-button-motion");
        observeOnce([box].filter(Boolean), function () {
            section.classList.add("wm-final-motion-in");
        }, { threshold: 0.18 });
    })();

    /* Desktop-only interpolated cursor glow. */
    (function initCursorGlow() {
        if (coarsePointer || window.innerWidth < 992) return;
        var glow = doc.createElement("span");
        glow.className = "wm-cursor-glow";
        glow.setAttribute("aria-hidden", "true");
        doc.body.appendChild(glow);
        var tx = window.innerWidth / 2, ty = window.innerHeight / 2, x = tx, y = ty;
        window.addEventListener("pointermove", function (event) {
            tx = event.clientX; ty = event.clientY; glow.classList.add("is-visible");
        }, { passive: true });
        window.addEventListener("mouseout", function (event) {
            if (!event.relatedTarget) glow.classList.remove("is-visible");
        });
        function render() {
            x += (tx - x) * 0.075; y += (ty - y) * 0.075;
            glow.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) translate(-50%,-50%)";
            window.requestAnimationFrame(render);
        }
        window.requestAnimationFrame(render);
    })();

    /* Mobile menu link stagger hooks after SlickNav initialization. */
    (function initMobileMenuMotion() {
        function decorate() {
            var nav = doc.querySelector(".slicknav_nav");
            if (!nav) return;
            toArray(nav.querySelectorAll("a")).forEach(function (link, index) {
                link.style.setProperty("--wm-menu-delay", Math.min(index * 45, 270) + "ms");
            });
        }
        window.setTimeout(decorate, 50);
        window.setTimeout(decorate, 350);
    })();
})();


/* =========================================================
   HERO — MINT NEURAL PARTICLE MESH
   Lightweight Canvas 2D ambient technology network
   ========================================================= */

(function initMintNeuralMesh() {

    var hero = doc.querySelector(".wm-hero");
    var canvas = doc.getElementById("wm-neural-canvas");

    if (!hero || !canvas) return;

    var ctx = canvas.getContext("2d", {
        alpha: true
    });

    if (!ctx) return;


    /* -----------------------------------------------------
       CONFIGURATION
       ----------------------------------------------------- */

    var config = {

        desktopDensity: 14500,
        tabletDensity: 18000,
        mobileDensity: 26000,

        minParticles: 22,
        maxParticles: 72,

        connectionDistance: 138,

        particleMinRadius: 0.9,
        particleMaxRadius: 2.15,

        baseSpeed: 0.085,

        mouseRadius: 180,
        mouseForce: 0.0035,

        lineOpacity: 0.15,
        dotOpacity: 0.68
    };


    /* -----------------------------------------------------
       STATE
       ----------------------------------------------------- */

    var width = 0;
    var height = 0;
    var dpr = 1;

    var particles = [];

    var animationFrame = null;

    var visible = true;

    var mouse = {
        x: 0,
        y: 0,
        active: false
    };


    /* -----------------------------------------------------
       HELPERS
       ----------------------------------------------------- */

    function random(min, max) {

        return Math.random() * (max - min) + min;

    }


    function getDensity() {

        if (window.innerWidth <= 767) {
            return config.mobileDensity;
        }

        if (window.innerWidth <= 1199) {
            return config.tabletDensity;
        }

        return config.desktopDensity;

    }


    function calculateParticleCount() {

        var area = width * height;

        var count =
            Math.floor(
                area / getDensity()
            );

        return clamp(
            count,
            config.minParticles,
            config.maxParticles
        );

    }


    /* -----------------------------------------------------
       PARTICLE
       ----------------------------------------------------- */

    function createParticle() {

        var speed =
            config.baseSpeed *
            random(0.55, 1.25);

        var angle =
            random(
                0,
                Math.PI * 2
            );

        return {

            x: random(0, width),

            y: random(0, height),

            vx:
                Math.cos(angle) *
                speed,

            vy:
                Math.sin(angle) *
                speed,

            radius:
                random(
                    config.particleMinRadius,
                    config.particleMaxRadius
                ),

            pulse:
                random(
                    0,
                    Math.PI * 2
                ),

            pulseSpeed:
                random(
                    0.008,
                    0.018
                )

        };

    }


    function rebuildParticles() {

        var targetCount =
            calculateParticleCount();

        particles = [];

        for (
            var i = 0;
            i < targetCount;
            i++
        ) {

            particles.push(
                createParticle()
            );

        }

    }


    /* -----------------------------------------------------
       CANVAS RESIZE
       ----------------------------------------------------- */

    function resizeCanvas() {

        var bounds =
            hero.getBoundingClientRect();

        width =
            Math.max(
                1,
                bounds.width
            );

        height =
            Math.max(
                1,
                bounds.height
            );

        /*
         * DPR capped to 1.75.
         * Prevents excessive GPU load on 3x / 4x phones.
         */
        dpr =
            Math.min(
                window.devicePixelRatio || 1,
                1.75
            );

        canvas.width =
            Math.round(
                width * dpr
            );

        canvas.height =
            Math.round(
                height * dpr
            );

        canvas.style.width =
            width + "px";

        canvas.style.height =
            height + "px";

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

        rebuildParticles();

    }


    /* -----------------------------------------------------
       PARTICLE MOVEMENT
       ----------------------------------------------------- */

    function updateParticle(particle) {

        /*
         * Very subtle pointer influence.
         * Particles bend slightly around cursor.
         */

        if (mouse.active && !coarsePointer) {

            var dx =
                particle.x -
                mouse.x;

            var dy =
                particle.y -
                mouse.y;

            var distanceSquared =
                dx * dx +
                dy * dy;

            var mouseRadiusSquared =
                config.mouseRadius *
                config.mouseRadius;

            if (
                distanceSquared > 0 &&
                distanceSquared <
                    mouseRadiusSquared
            ) {

                var distance =
                    Math.sqrt(
                        distanceSquared
                    );

                var force =
                    1 -
                    (
                        distance /
                        config.mouseRadius
                    );

                particle.vx +=
                    (
                        dx /
                        distance
                    ) *
                    force *
                    config.mouseForce;

                particle.vy +=
                    (
                        dy /
                        distance
                    ) *
                    force *
                    config.mouseForce;

            }

        }


        /*
         * Keep movement restrained.
         */

        var speed =
            Math.sqrt(
                particle.vx *
                particle.vx +
                particle.vy *
                particle.vy
            );

        var maxSpeed = 0.19;

        if (speed > maxSpeed) {

            particle.vx =
                (
                    particle.vx /
                    speed
                ) *
                maxSpeed;

            particle.vy =
                (
                    particle.vy /
                    speed
                ) *
                maxSpeed;

        }


        particle.x +=
            particle.vx;

        particle.y +=
            particle.vy;


        /*
         * Infinite wrap.
         */

        var margin = 15;

        if (
            particle.x <
            -margin
        ) {

            particle.x =
                width + margin;

        }

        else if (
            particle.x >
            width + margin
        ) {

            particle.x =
                -margin;

        }


        if (
            particle.y <
            -margin
        ) {

            particle.y =
                height + margin;

        }

        else if (
            particle.y >
            height + margin
        ) {

            particle.y =
                -margin;

        }


        particle.pulse +=
            particle.pulseSpeed;

    }


    /* -----------------------------------------------------
       CONNECTION LINES
       ----------------------------------------------------- */

    function drawConnections() {

        var distanceLimit =
            config.connectionDistance;

        var distanceLimitSquared =
            distanceLimit *
            distanceLimit;


        for (
            var i = 0;
            i < particles.length;
            i++
        ) {

            var a =
                particles[i];


            for (
                var j = i + 1;
                j < particles.length;
                j++
            ) {

                var b =
                    particles[j];

                var dx =
                    a.x -
                    b.x;

                var dy =
                    a.y -
                    b.y;

                var distanceSquared =
                    dx * dx +
                    dy * dy;


                if (
                    distanceSquared >
                    distanceLimitSquared
                ) {

                    continue;

                }


                var distance =
                    Math.sqrt(
                        distanceSquared
                    );


                var strength =
                    1 -
                    (
                        distance /
                        distanceLimit
                    );


                /*
                 * Mint → cyan network lines.
                 */

                var opacity =
                    strength *
                    config.lineOpacity;


                ctx.beginPath();

                ctx.moveTo(
                    a.x,
                    a.y
                );

                ctx.lineTo(
                    b.x,
                    b.y
                );

                ctx.strokeStyle =
                    "rgba(0, 190, 145, " +
                    opacity.toFixed(3) +
                    ")";

                ctx.lineWidth =
                    0.72;

                ctx.stroke();

            }

        }

    }

    /* -----------------------------------------------------
   TRAVELING DATA SIGNALS
   Small mint packets move through active neural links.
----------------------------------------------------- */

function drawDataSignals(time) {

    if (
        !particles ||
        particles.length < 2
    ) {

        return;

    }


    /*
     * Only a few signals at once.
     * Keeps visual restrained and performance cheap.
    */

    var signalCount =
        Math.min(
            5,
            Math.floor(
                particles.length /
                8
            )
        );


    for (
        var i = 0;
        i < signalCount;
        i++
    ) {

        /*
         * Deterministic changing pair selection.
        */

        var startIndex =
            (
                i * 7 +
                Math.floor(
                    time /
                    5200
                )
            )
            %
            particles.length;


        var start =
            particles[
                startIndex
            ];


        if (!start) continue;


        /*
         * Find nearest valid connected node.
        */

        var target = null;

        var nearestDistance =
            Infinity;


        for (
            var j = 0;
            j < particles.length;
            j++
        ) {

            if (
                j === startIndex
            ) {

                continue;

            }


            var candidate =
                particles[j];


            var dx =
                candidate.x -
                start.x;


            var dy =
                candidate.y -
                start.y;


            var distanceSquared =
                dx * dx +
                dy * dy;


            if (
                distanceSquared <
                    nearestDistance &&

                distanceSquared <
                    config.connectionDistance *
                    config.connectionDistance
            ) {

                nearestDistance =
                    distanceSquared;

                target =
                    candidate;

            }

        }


        if (!target) continue;


        /*
         * Signal travels continuously 0 → 1.
        */

        var progress =
            (
                (
                    time *
                    0.00016
                ) +
                (
                    i /
                    signalCount
                )
            ) % 1;


        /*
         * Smooth acceleration/deceleration.
        */

        var smoothProgress =
            progress *
            progress *
            (
                3 -
                2 *
                progress
            );


        var x =
            start.x +
            (
                target.x -
                start.x
            ) *
            smoothProgress;


        var y =
            start.y +
            (
                target.y -
                start.y
            ) *
            smoothProgress;


        /*
         * Outer soft halo.
        */

        var halo =
            ctx.createRadialGradient(
                x,
                y,
                0,
                x,
                y,
                9
            );


        halo.addColorStop(
            0,
            "rgba(86,255,211,0.42)"
        );


        halo.addColorStop(
            0.35,
            "rgba(0,208,132,0.14)"
        );


        halo.addColorStop(
            1,
            "rgba(0,208,132,0)"
        );


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            9,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            halo;

        ctx.fill();


        /*
         * Bright data packet core.
        */

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            1.65,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "rgba(222,255,246,0.92)";


        ctx.fill();

    }

}

    /* -----------------------------------------------------
       PARTICLE NODES
       ----------------------------------------------------- */

    function drawParticles() {

        for (
            var i = 0;
            i < particles.length;
            i++
        ) {

            var particle =
                particles[i];


            var pulse =
                (
                    Math.sin(
                        particle.pulse
                    ) +
                    1
                ) * 0.5;


            var radius =
                particle.radius +
                pulse * 0.35;


            var opacity =
                config.dotOpacity +
                pulse * 0.16;


            /*
             * Soft halo
             */

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                radius * 3.6,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "rgba(0, 208, 132, " +
                (
                    0.025 +
                    pulse * 0.025
                ).toFixed(3) +
                ")";

            ctx.fill();


            /*
             * Bright neural node
             */

            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle =
                "rgba(0, 184, 137, " +
                opacity.toFixed(3) +
                ")";

            ctx.fill();

        }

    }


    /* -----------------------------------------------------
       DATA PULSE NODES
       Occasional brighter points create intelligent network
       feeling without flashing aggressively.
       ----------------------------------------------------- */

    function drawPulseNodes(time) {

        if (!particles.length) return;

        var total =
            Math.min(
                3,
                particles.length
            );


        for (
            var i = 0;
            i < total;
            i++
        ) {

            var index =
                Math.floor(
                    (
                        time /
                        (
                            3600 +
                            i * 900
                        )
                    ) %
                    particles.length
                );

            var particle =
                particles[index];

            if (!particle) continue;


            var pulse =
                (
                    Math.sin(
                        time *
                        0.0015 +
                        i *
                        2
                    ) +
                    1
                ) * 0.5;


            var radius =
                3 +
                pulse * 5;


            ctx.beginPath();

            ctx.arc(
                particle.x,
                particle.y,
                radius,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle =
                "rgba(0, 208, 132, " +
                (
                    0.05 +
                    pulse *
                    0.13
                ).toFixed(3) +
                ")";

            ctx.lineWidth = 1;

            ctx.stroke();

        }

    }


    /* -----------------------------------------------------
       RENDER LOOP
       ----------------------------------------------------- */

    function render(time) {

        if (!visible) {

            animationFrame =
                window.requestAnimationFrame(
                    render
                );

            return;

        }


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        for (
            var i = 0;
            i < particles.length;
            i++
        ) {

            updateParticle(
                particles[i]
            );

        }


   drawConnections();

/*
 * Animated information packets traveling
 * through the neural network.
 */
drawDataSignals(
    time || 0
);

drawParticles();

drawPulseNodes(
    time || 0
);

        animationFrame =
            window.requestAnimationFrame(
                render
            );

    }


    /* -----------------------------------------------------
       POINTER INTERACTION
       ----------------------------------------------------- */

    if (!coarsePointer) {

        hero.addEventListener(
            "pointermove",
            function (event) {

                var rect =
                    hero.getBoundingClientRect();

                mouse.x =
                    event.clientX -
                    rect.left;

                mouse.y =
                    event.clientY -
                    rect.top;

                mouse.active =
                    true;

            },
            {
                passive: true
            }
        );


        hero.addEventListener(
            "pointerleave",
            function () {

                mouse.active =
                    false;

            },
            {
                passive: true
            }
        );

    }


    /* -----------------------------------------------------
       STOP HEAVY DRAWING WHEN HERO IS OFF SCREEN
       ----------------------------------------------------- */

    if (
        "IntersectionObserver" in window
    ) {

        var heroObserver =
            new IntersectionObserver(
                function (entries) {

                    entries.forEach(
                        function (entry) {

                            visible =
                                entry.isIntersecting;

                        }
                    );

                },
                {
                    threshold: 0
                }
            );

        heroObserver.observe(
            hero
        );

    }


    /* -----------------------------------------------------
       RESIZE HANDLING
       ----------------------------------------------------- */

    var resizeTimer = null;

    window.addEventListener(
        "resize",
        function () {

            window.clearTimeout(
                resizeTimer
            );

            resizeTimer =
                window.setTimeout(
                    resizeCanvas,
                    180
                );

        },
        {
            passive: true
        }
    );


    /* -----------------------------------------------------
       START
       ----------------------------------------------------- */

    resizeCanvas();

    animationFrame =
        window.requestAnimationFrame(
            render
        );

})();


/* =========================================================
   BITMINT LAB — FOOTER NEURAL AMBIENCE
   Low-density calm neural network
========================================================= */

(function initFooterNeuralMesh() {

    var footer =
        doc.querySelector(
            ".wm-footer"
        );

    var canvas =
        doc.getElementById(
            "wm-footer-neural-canvas"
        );


    if (
        !footer ||
        !canvas
    ) {

        return;

    }


    var ctx =
        canvas.getContext(
            "2d",
            {
                alpha: true
            }
        );


    if (!ctx) {

        return;

    }


    var width = 0;

    var height = 0;

    var dpr = 1;

    var particles = [];

    var visible = true;


    var config = {

        minParticles: 12,

        maxParticles: 34,

        connectionDistance: 145,

        speed: 0.045

    };


    /* -----------------------------------------------------
       RANDOM
    ----------------------------------------------------- */

    function random(
        min,
        max
    ) {

        return (
            Math.random() *
            (
                max -
                min
            )
        ) + min;

    }


    /* -----------------------------------------------------
       PARTICLE
    ----------------------------------------------------- */

    function createParticle() {

        var angle =
            random(
                0,
                Math.PI * 2
            );


        var speed =
            config.speed *
            random(
                0.55,
                1.15
            );


        return {

            x:
                random(
                    0,
                    width
                ),

            y:
                random(
                    0,
                    height
                ),

            vx:

                Math.cos(
                    angle
                ) *
                speed,

            vy:

                Math.sin(
                    angle
                ) *
                speed,

            radius:

                random(
                    0.7,
                    1.6
                )

        };

    }


    /* -----------------------------------------------------
       RESIZE
    ----------------------------------------------------- */

    function resize() {

        var bounds =
            footer.getBoundingClientRect();


        width =
            Math.max(
                1,
                bounds.width
            );


        height =
            Math.max(
                1,
                bounds.height
            );


        dpr =
            Math.min(
                window.devicePixelRatio || 1,
                1.5
            );


        canvas.width =
            Math.round(
                width *
                dpr
            );


        canvas.height =
            Math.round(
                height *
                dpr
            );


        canvas.style.width =
            width + "px";


        canvas.style.height =
            height + "px";


        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        var density =
            window.innerWidth <
            768
                ? 42000
                : 30000;


        var count =
            Math.floor(
                (
                    width *
                    height
                ) /
                density
            );


        count =
            Math.max(
                config.minParticles,
                Math.min(
                    config.maxParticles,
                    count
                )
            );


        particles = [];


        for (
            var i = 0;
            i < count;
            i++
        ) {

            particles.push(
                createParticle()
            );

        }

    }


    /* -----------------------------------------------------
       MOVE
    ----------------------------------------------------- */

    function update() {

        for (
            var i = 0;
            i < particles.length;
            i++
        ) {

            var p =
                particles[i];


            p.x +=
                p.vx;


            p.y +=
                p.vy;


            if (
                p.x <
                -12
            ) {

                p.x =
                    width + 12;

            }


            else if (
                p.x >
                width + 12
            ) {

                p.x =
                    -12;

            }


            if (
                p.y <
                -12
            ) {

                p.y =
                    height + 12;

            }


            else if (
                p.y >
                height + 12
            ) {

                p.y =
                    -12;

            }

        }

    }


    /* -----------------------------------------------------
       CONNECTIONS
    ----------------------------------------------------- */

    function drawConnections() {

        var maxDistance =
            config.connectionDistance;


        var maxDistanceSquared =
            maxDistance *
            maxDistance;


        for (
            var i = 0;
            i < particles.length;
            i++
        ) {

            for (
                var j =
                    i + 1;
                j <
                    particles.length;
                j++
            ) {

                var a =
                    particles[i];


                var b =
                    particles[j];


                var dx =
                    a.x -
                    b.x;


                var dy =
                    a.y -
                    b.y;


                var distanceSquared =
                    (
                        dx *
                        dx
                    ) +
                    (
                        dy *
                        dy
                    );


                if (
                    distanceSquared >
                    maxDistanceSquared
                ) {

                    continue;

                }


                var distance =
                    Math.sqrt(
                        distanceSquared
                    );


                var strength =
                    1 -
                    (
                        distance /
                        maxDistance
                    );


                ctx.beginPath();


                ctx.moveTo(
                    a.x,
                    a.y
                );


                ctx.lineTo(
                    b.x,
                    b.y
                );


                ctx.strokeStyle =

                    "rgba(93, 225, 184, " +

                    (
                        strength *
                        0.09
                    ).toFixed(
                        3
                    )

                    + ")";


                ctx.lineWidth =
                    0.65;


                ctx.stroke();

            }

        }

    }


    /* -----------------------------------------------------
       NODES
    ----------------------------------------------------- */

    function drawNodes() {

        for (
            var i = 0;
            i < particles.length;
            i++
        ) {

            var p =
                particles[i];


            ctx.beginPath();


            ctx.arc(
                p.x,
                p.y,
                p.radius,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "rgba(105, 237, 190, 0.42)";


            ctx.fill();

        }

    }


    /* -----------------------------------------------------
       RENDER
    ----------------------------------------------------- */

    function render() {

        if (visible) {

            ctx.clearRect(
                0,
                0,
                width,
                height
            );


            update();

            drawConnections();

            drawNodes();

        }


        window.requestAnimationFrame(
            render
        );

    }


    /* -----------------------------------------------------
       VISIBILITY OPTIMIZATION
    ----------------------------------------------------- */

    if (
        "IntersectionObserver"
        in window
    ) {

        var observer =
            new IntersectionObserver(

                function (
                    entries
                ) {

                    visible =
                        entries[0]
                            .isIntersecting;

                },

                {
                    threshold:
                        0
                }

            );


        observer.observe(
            footer
        );

    }


    /* -----------------------------------------------------
       RESIZE
    ----------------------------------------------------- */

    var resizeTimer;


    window.addEventListener(

        "resize",

        function () {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    resize,
                    180
                );

        },

        {
            passive:
                true
        }

    );


    resize();


    window.requestAnimationFrame(
        render
    );

})();


/* =========================================================
   FOOTER — MOUSE REACTIVE LOCAL GLOW
========================================================= */

(function initFooterCursorGlow() {

    var footer =
        doc.querySelector(
            ".wm-footer"
        );


    var glow =
        doc.getElementById(
            "wm-footer-cursor-glow"
        );


    if (
        !footer ||
        !glow ||
        coarsePointer
    ) {

        return;

    }


    var targetX =
        -1000;

    var targetY =
        -1000;


    var currentX =
        -1000;

    var currentY =
        -1000;


    footer.addEventListener(

        "pointermove",

        function (
            event
        ) {

            var rect =
                footer.getBoundingClientRect();


            targetX =
                event.clientX -
                rect.left;


            targetY =
                event.clientY -
                rect.top;

        },

        {
            passive:
                true
        }

    );


    function animate() {

        currentX +=
            (
                targetX -
                currentX
            ) *
            0.08;


        currentY +=
            (
                targetY -
                currentY
            ) *
            0.08;


        glow.style.setProperty(

            "--wm-footer-cursor-x",

            currentX +
            "px"

        );


        glow.style.setProperty(

            "--wm-footer-cursor-y",

            currentY +
            "px"

        );


        window.requestAnimationFrame(
            animate
        );

    }


    window.requestAnimationFrame(
        animate
    );

})();