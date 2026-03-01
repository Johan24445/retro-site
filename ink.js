/* ============================================================
   ink.js — shared ink trail + fire audio for all pages

   USAGE: include this script at the bottom of any page,
   and set these flags BEFORE the <script src="ink.js"> tag:

     <script>
       window.INK_ENABLED   = true;   // ← toggle ink trail on/off
       window.AUDIO_ENABLED = true;   // ← toggle fire audio on/off
     </script>
     <script src="ink.js"></script>

   Set either flag to false to disable that feature for that page.
   Use window.INK_ENABLED (not const) so ink.js can always read it.
============================================================ */

(function () {

    /* ── FIRE AUDIO ── */
    if (window.AUDIO_ENABLED !== false) {
        const inkAudio = document.createElement('audio');
        inkAudio.src    = 'sounds/firesound.mp3';
        inkAudio.loop   = true;
        inkAudio.volume = 0.4;
        inkAudio.preload = 'auto';
        document.body.appendChild(inkAudio);

        // Persist mute state across pages
        let muted = sessionStorage.getItem('audioMuted') === 'true';

        // Audio toggle button — always visible in top-right corner
        const btn = document.createElement('button');
        btn.id = 'audio-toggle';
        btn.style.cssText = `
            position: fixed;
            top: 12px;
            right: 12px;
            z-index: 999999;
            background: rgba(42, 28, 16, 0.85);
            border: 2px solid #5a4a36;
            color: #c9b896;
            font-family: 'Press Start 2P', monospace;
            font-size: 20px;      /* ← change this to resize the button text */
            padding: 5px 10px;   /* ← change this to resize button padding */
            cursor: pointer;
            letter-spacing: 1px;
            transform-origin: top right;
            transform: scale(calc(1 / (devicePixelRatio / (devicePixelRatio < 2 ? 1 : devicePixelRatio))));
        `;

        function updateBtn() {
            btn.innerHTML = `<span style="font-size:22px;vertical-align:middle;">♪</span><span style="font-size:14px;vertical-align:middle;margin-left:4px;">${muted ? 'OFF' : 'ON'}</span>`;
            btn.style.opacity = muted ? '0.5' : '1';
        }
        updateBtn();

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            muted = !muted;
            sessionStorage.setItem('audioMuted', muted);
            if (muted) {
                inkAudio.pause();
            } else {
                inkAudio.play().catch(() => {});
            }
            updateBtn();
        });

        document.body.appendChild(btn);

        // Auto-start if not muted
        if (!muted) {
            const tryPlay = () => {
                inkAudio.play().catch(() => {});
                document.removeEventListener('pointerdown', tryPlay);
                document.removeEventListener('keydown', tryPlay);
            };
            // Try immediately (works if user already interacted on a previous page)
            inkAudio.play().catch(() => {
                // Blocked — wait for next real gesture
                document.addEventListener('pointerdown', tryPlay);
                document.addEventListener('keydown', tryPlay);
            });
        }
    }

    /* ── INK TRAIL ── */
    if (window.INK_ENABLED === false) return;

    const COLOURS = [
        'rgba(14, 8, 3, 0.97)',
        'rgba(10, 5, 2, 1)',
        'rgba(20, 12, 5, 0.95)',
        'rgba(8, 4, 1, 1)',
        'rgba(26, 16, 6, 0.9)',
    ];

    /* Inject keyframe once — variable named inkStyle to avoid clash with script.js */
    const inkStyle = document.createElement('style');
    inkStyle.textContent = `
        @keyframes ink-blob-fade {
            0%   { opacity: 0.97; }
            50%  { opacity: 0.95; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(inkStyle);

    let lastX = 0, lastY = 0, frameCount = 0;

    function rand(a, b) { return a + Math.random() * (b - a); }
    function pick(arr)  { return arr[Math.floor(Math.random() * arr.length)]; }

    function spawnBlob(x, y, size) {
        const el = document.createElement('div');
        const r  = () => Math.floor(rand(38, 62));
        el.style.cssText = `
            position:fixed;pointer-events:none;z-index:99999;
            left:${x + rand(-size*.3, size*.3)}px;
            top:${y  + rand(-size*.3, size*.3)}px;
            width:${size}px;height:${size * rand(.75,1.25)}px;
            background:${pick(COLOURS)};
            border-radius:${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%;
            transform:translate(-50%,-50%) rotate(${rand(0,360)}deg);
            animation:ink-blob-fade ${rand(.9,1.8)}s ease-out forwards;
        `;
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }

    function spawnTeardrop(x, y, angle) {
        const el   = document.createElement('div');
        const dist = rand(10, 45);
        el.style.cssText = `
            position:fixed;pointer-events:none;z-index:99999;
            left:${x + Math.cos(angle) * dist}px;
            top:${y  + Math.sin(angle) * dist}px;
            width:${rand(10,35)}px;height:${rand(5,14)}px;
            background:${pick(COLOURS)};
            border-radius:50% 50% 50% 50% / 60% 60% 40% 40%;
            transform:translate(-50%,-50%) rotate(${angle * 180 / Math.PI}deg);
            animation:ink-blob-fade ${rand(.8,1.5)}s ease-out forwards;
        `;
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }

    function spawnDot(x, y, radius) {
        const el  = document.createElement('div');
        const ang = rand(0, Math.PI * 2);
        const sz  = rand(2, 7);
        el.style.cssText = `
            position:fixed;pointer-events:none;z-index:99999;
            left:${x + Math.cos(ang) * rand(radius*.2, radius)}px;
            top:${y  + Math.sin(ang) * rand(radius*.2, radius)}px;
            width:${sz}px;height:${sz}px;
            background:${pick(COLOURS)};
            border-radius:50%;
            transform:translate(-50%,-50%);
            animation:ink-blob-fade ${rand(.7,1.4)}s ease-out forwards;
        `;
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }

    function splat(x, y, scale) {
        spawnBlob(x, y, rand(18, 40) * scale);
        for (let i = 0; i < Math.floor(rand(2, 5)); i++) {
            const a = rand(0, Math.PI*2), d = rand(8, 30) * scale;
            spawnBlob(x + Math.cos(a)*d, y + Math.sin(a)*d, rand(8, 22) * scale);
        }
        for (let i = 0; i < Math.floor(rand(3, 7));  i++) spawnTeardrop(x, y, rand(0, Math.PI*2));
        for (let i = 0; i < Math.floor(rand(6, 14)); i++) spawnDot(x, y, 65 * scale);
    }

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX, y = e.clientY;
        const dx = x - lastX, dy = y - lastY;
        const speed = Math.sqrt(dx*dx + dy*dy);
        frameCount++;

        if (frameCount % 3 === 0) {
            spawnBlob(x, y, rand(10, 22));
            spawnDot(x, y, 20);
        }
        if (speed > 8 && frameCount % 2 === 0) {
            const a = Math.atan2(dy, dx);
            spawnBlob(x, y, rand(14, 28));
            spawnTeardrop(x, y, a + rand(-.3, .3));
            for (let i = 0; i < Math.floor(rand(2,5)); i++) spawnDot(x, y, 35);
        }
        if (speed > 22 && frameCount % 4 === 0) {
            splat(x, y, Math.min(speed / 22, 1.6));
        }

        lastX = x; lastY = y;
    });

    document.addEventListener('click', (e) => {
        // Don't splat when clicking interactive elements — lets menu, links, buttons work normally
        if (e.target.closest('a, button, .menu-item, input, textarea, select, label')) return;
        splat(e.clientX, e.clientY, 1.5);
    });

})();