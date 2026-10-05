// ActivationAgents opening animation.
// Extension: load intro/aa-intro.js with a plain script tag as the FIRST line inside body.
(() => {
  const ONCE_PER_SESSION = true;   // false = plays on every popup open
  const DROPS = 'none';            // 'none' = no droplets, 'brand' = HighLevel/AA/Claude colors, 'purple' = AA purples
  const KEY = 'aaIntroSeen';
  const T_IMPACT = 1980;           // the slam
  const T_END = T_IMPACT + 1900;

  function play({ mount = document.body, assets, onDone, drops = DROPS } = {}) {
    const A = assets;
    const root = document.createElement('div');
    root.className = 'aa-intro';
    root.setAttribute('aria-hidden', 'true');
    if (mount !== document.body) root.style.position = 'absolute';
    root.innerHTML =
      '<div class="aa-bg"></div><div class="aa-stage"><div class="aa-shake">' +
      '<div class="aa-scene">' + slot(A.hl, 74) + slot(A.aa, 104) + slot(A.claude, 60) + '</div>' +
      '<div class="aa-flash"></div><div class="aa-ring"></div>' +
      '<div class="aa-final"><div class="aa-markbox">' +
        `<div class="aa-liquid" style="--aa-mask:url('${A.aa}')"></div>` +
        `<img class="aa-mark" src="${A.aa}" alt="">` +
      `</div><img class="aa-word" src="${A.word}" alt=""></div>` +
      '<canvas class="aa-drops" width="1200" height="1200"></canvas>' +
      '</div></div>';
    mount.prepend(root);

    const r = root.getBoundingClientRect();
    root.style.setProperty('--aa-s', Math.min(r.width / 360, r.height / 380, 1.6).toFixed(3));

    let raf = 0, alive = true;
    const finish = () => {
      if (!alive) return; alive = false;
      cancelAnimationFrame(raf); root.remove(); onDone && onDone();
    };
    root.addEventListener('click', finish);
    setTimeout(finish, T_END + 1500); // safety net

    const imgs = [...root.querySelectorAll('img')];
    Promise.all(imgs.map(i => i.decode().catch(() => {}))).then(() => alive && start());

    function start() {
      const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
      const anim = (el, kf, o) => el.animate(kf, { fill: 'both', ...o });
      const xs = [-104, 0, 104], at = ms => ms / T_IMPACT;
      const fall = 'cubic-bezier(.55,0,1,.55)', rise = 'cubic-bezier(0,.55,.45,1)';

      // 1. drop in from above, bounce three times with squash and stretch
      $$('.aa-ico').forEach((el, i) => anim(el, [
        { transform: 'translateY(-250px) scale(.88,1.14)', opacity: 0, easing: fall },
        { opacity: 1, offset: .08 },
        { transform: 'translateY(0) scale(1.3,.7)', offset: .3, easing: rise },
        { transform: 'translateY(-74px) scale(.9,1.12)', offset: .48, easing: fall },
        { transform: 'translateY(0) scale(1.2,.8)', offset: .62, easing: rise },
        { transform: 'translateY(-30px) scale(.95,1.06)', offset: .74, easing: fall },
        { transform: 'translateY(0) scale(1.1,.9)', offset: .84, easing: rise },
        { transform: 'translateY(-10px) scale(1,1)', offset: .91, easing: fall },
        { transform: 'translateY(0) scale(1.04,.96)', offset: .96, easing: 'ease-out' },
        { transform: 'none', opacity: 1 }
      ], { duration: 960, delay: i * 110 }));

      // 2. excited double hop, rolling left to right
      $$('.aa-hop').forEach((el, i) => anim(el, [
        { transform: 'none', easing: rise },
        { transform: 'translateY(-36px) scale(.92,1.1)', offset: .3, easing: fall },
        { transform: 'translateY(0) scale(1.16,.84)', offset: .55, easing: rise },
        { transform: 'translateY(-13px)', offset: .75, easing: fall },
        { transform: 'translateY(0) scale(1.06,.94)', offset: .9, easing: 'ease-out' },
        { transform: 'none' }
      ], { duration: 400, delay: 1190 + i * 80 }));

      // 3. pull back and spread, 4. slam
      $$('.aa-slot').forEach((el, i) => {
        anim(el, [
          { transform: `translateX(${xs[i]}px)` },
          { transform: `translateX(${xs[i]}px)`, offset: at(1480), easing: 'cubic-bezier(.3,0,.2,1)' },
          { transform: `translateX(${xs[i] * 1.45}px)`, offset: at(1800), easing: 'cubic-bezier(.65,0,1,.55)' },
          { transform: 'translateX(0px)' }
        ], { duration: T_IMPACT });
        anim(el, [{ opacity: 1 }, { opacity: 1, offset: at(T_IMPACT - 15) }, { opacity: 0 }], { duration: T_IMPACT });
      });
      $$('.aa-wrap').forEach(el => anim(el, [
        { transform: 'translate(-50%,-50%)' },
        { transform: 'translate(-50%,-50%)', offset: at(1620), easing: 'ease-in-out' },
        { transform: 'translate(-50%,-50%) scale(.9,1.08)', offset: at(1800), easing: 'ease-in' },
        { transform: 'translate(-50%,-50%) scale(1.18,.88)' }
      ], { duration: T_IMPACT }));
      anim($('.aa-scene'), [
        { transform: 'scale(1)' },
        { transform: 'scale(1)', offset: at(1480), easing: 'cubic-bezier(.3,0,.2,1)' },
        { transform: 'scale(.76)', offset: at(1800), easing: 'cubic-bezier(.65,0,1,.55)' },
        { transform: 'scale(1.08)' }
      ], { duration: T_IMPACT });

      // impact
      anim($('.aa-flash'), [
        { transform: 'translate(-50%,-50%) scale(.2)', opacity: 1 },
        { transform: 'translate(-50%,-50%) scale(2.4)', opacity: 0 }
      ], { duration: 380, delay: T_IMPACT, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'forwards' });
      anim($('.aa-ring'), [
        { transform: 'translate(-50%,-50%) scale(.15)', opacity: .95 },
        { transform: 'translate(-50%,-50%) scale(3.3)', opacity: 0 }
      ], { duration: 560, delay: T_IMPACT, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'forwards' });
      anim($('.aa-shake'), [
        { transform: 'translate(0,0)' }, { transform: 'translate(9px,-6px)' }, { transform: 'translate(-8px,5px)' },
        { transform: 'translate(6px,3px)' }, { transform: 'translate(-3px,-2px)' }, { transform: 'translate(0,0)' }
      ], { duration: 320, delay: T_IMPACT });

      // 5. logo pops out of the hit as rainbow liquid, wobbling like jelly
      anim($('.aa-liquid'), [
        { opacity: 0, transform: 'scale(.2)' },
        { opacity: 1, transform: 'scale(1.24,1.12)', offset: .18, easing: 'ease-out' },
        { transform: 'scale(.9,.96)', offset: .34, easing: 'ease-in-out' },
        { transform: 'scale(1.07,1.03)', offset: .5, easing: 'ease-in-out' },
        { transform: 'scale(.98,1)', offset: .64, easing: 'ease-in-out' },
        { opacity: 1, transform: 'scale(1)', offset: .74 },
        { opacity: 0, transform: 'scale(1)' }
      ], { duration: 1150, delay: T_IMPACT - 20 });
      anim($('.aa-liquid'), [{ '--aa-ang': '0deg' }, { '--aa-ang': '420deg' }],
        { duration: 1150, delay: T_IMPACT - 20, easing: 'cubic-bezier(.2,.6,.3,1)', composite: 'replace' });
      // water droplets spray off it
      const draw = drops === 'none' ? () => {} : droplets($('.aa-drops'), drops);
      const t0 = performance.now();
      const loop = now => {
        const t = (now - t0 - T_IMPACT) / 1000;
        draw(t);
        if (t < 1.4 && alive) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      // 6. settles into the real logo
      anim($('.aa-mark'), [
        { opacity: 0, filter: 'drop-shadow(0 0 4px rgba(162,115,245,.3)) drop-shadow(0 0 10px rgba(124,69,219,.2))' },
        { opacity: 1, filter: 'drop-shadow(0 0 16px rgba(199,159,255,.95)) drop-shadow(0 0 40px rgba(124,69,219,.7))', offset: .45 },
        { opacity: 1, filter: 'drop-shadow(0 0 10px rgba(162,115,245,.7)) drop-shadow(0 0 28px rgba(124,69,219,.45))' }
      ], { duration: 700, delay: T_IMPACT + 780, easing: 'ease-out' });
      anim($('.aa-word'), [
        { opacity: 0, transform: 'translateY(10px)', clipPath: 'inset(0 100% 0 0)' },
        { opacity: 1, transform: 'none', clipPath: 'inset(0 0% 0 0)' }
      ], { duration: 460, delay: T_IMPACT + 950, easing: 'cubic-bezier(.2,.8,.2,1)' });

      // exit
      anim(root, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.04)' }],
        { duration: 340, delay: T_END - 340, easing: 'ease-in' }).finished.then(finish).catch(() => {});
    }
    return { skip: finish };
  }

  function slot(src, w) {
    return `<div class="aa-slot"><div class="aa-wrap"><div class="aa-hop">` +
      `<img class="aa-ico" src="${src}" style="width:${w}px" alt=""></div></div></div>`;
  }

  // Rainbow water droplets thrown off the impact. t = seconds since impact.
  // Canvas is 600x600 design px, centered on the stage, drawn at 2x.
  const HL = ['#FFD000', '#2896FB', '#17D94B'], AA = ['#7C45DB', '#A273F5', '#C79FFF'], CL = ['#D97757'];
  function droplets(canvas, mode) {
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    let s = 23;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const C = 300, G = 950, K = 1.7;
    // left side throws HighLevel colors, right side Claude, center ActivationAgents
    const pick = cx => {
      if (mode === 'purple') return AA[Math.floor(rnd() * AA.length)];
      const set = cx < -.35 ? (rnd() < .75 ? HL : AA) : cx > .35 ? (rnd() < .7 ? CL : AA) : AA;
      return set[Math.floor(rnd() * set.length)];
    };
    const make = (n, t0, vMin, vMax, rMin, rMax) => Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + rnd() * .5;
      const v = vMin + rnd() * (vMax - vMin);
      return {
        t0, a, c: pick(Math.cos(a)),
        x0: Math.cos(a) * 62, y0: Math.sin(a) * 30,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v * .85 - 160,
        r: rMin + rnd() * (rMax - rMin), life: .75 + rnd() * .45
      };
    });
    const drops = [
      ...make(30, 0, 360, 820, 3.2, 7.5),     // main burst
      ...make(18, .09, 220, 520, 2.4, 5),     // second splash
      ...make(34, 0, 500, 1000, .9, 1.9)      // fine mist
    ];
    // position/velocity with drag K and gravity G (y only)
    const axis = (p0, v0, g, t) => {
      const e = Math.exp(-K * t), vt = g / K;
      return [p0 + vt * t + (v0 - vt) * (1 - e) / K, (v0 - vt) * e + vt];
    };
    return t => {
      ctx.clearRect(0, 0, 600, 600);
      if (t < 0) return;
      for (const d of drops) {
        const lt = t - d.t0;
        if (lt < 0 || lt > d.life) continue;
        const [x, vx] = axis(d.x0, d.vx, 0, lt);
        const [y, vy] = axis(d.y0, d.vy, G, lt);
        const fade = 1 - Math.max(0, (lt - d.life * .55) / (d.life * .45));
        const r = d.r * (.6 + .4 * fade);
        const px = C + x, py = C + y, sp = Math.hypot(vx, vy) || 1;
        const ux = vx / sp, uy = vy / sp, th = Math.atan2(uy, ux);
        const tail = r + Math.min(30, sp * .028);
        const col = d.c;
        ctx.globalAlpha = fade; ctx.fillStyle = col;
        if (r < 2) { ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; continue; }
        // teardrop: round head leading, tapered tail behind
        ctx.shadowColor = col; ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(px - ux * tail, py - uy * tail);
        ctx.arc(px, py, r, th - Math.PI / 2, th + Math.PI / 2);
        ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        // specular highlight so it reads as water
        ctx.fillStyle = 'rgba(255,255,255,.75)';
        ctx.beginPath(); ctx.arc(px - r * .3, py - r * .35, r * .32, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    };
  }

  window.AAIntro = { play };

  // Auto-run inside the extension popup.
  if (window.AA_INTRO_MANUAL) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const base = new URL('.', document.currentScript.src).href;
  const assets = {
    hl: base + 'highlevel-icon.svg', aa: base + 'activationagents-icon.svg',
    claude: base + 'claude-icon.svg', word: base + 'activationagents-logo.svg'
  };
  // Black cover goes up synchronously so the UI never flashes first.
  const cover = document.createElement('div');
  cover.className = 'aa-intro';
  document.body.prepend(cover);
  const go = () => { play({ assets }); cover.remove(); };
  const store = globalThis.chrome?.storage?.session;
  if (!ONCE_PER_SESSION || !store) return go();
  store.get(KEY).then(r => {
    if (r[KEY]) return cover.remove();
    store.set({ [KEY]: true }); go();
  }).catch(go);
})();
