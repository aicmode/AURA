/* ================================================================
   AURA — Beauty beyond labels.
   script.js
   ================================================================
   機能:
   1. フィルム粒子（canvas アニメーション）
   2. スクロールリビール（Intersection Observer）
   3. ナビゲーション挙動（スクロール / 表示・非表示）
   4. モバイルメニュー（ハンバーガー開閉）
   5. Hero パララックス（軽量版）
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initFilmGrain();
  initScrollReveal();
  initNavBehavior();
  initMobileMenu();
  initParallax();
});


/* ----------------------------------------------------------------
   1. フィルム粒子（Film Grain）
   canvas にランダムノイズを低フレームレートで描画。
   12fps にすることで映画フィルムらしい間欠感を出します。
   ---------------------------------------------------------------- */
function initFilmGrain() {
  const canvas = document.getElementById('grainCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawGrain() {
    const { width, height } = canvas;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i]     = v;  // R
      data[i + 1] = v;  // G
      data[i + 2] = v;  // B
      /* Alpha: 最大約 18 / 255 ≈ 7%（とても控えめ） */
      data[i + 3] = (Math.random() * 18) | 0;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /* 12fps でアニメーション */
  const fps = 12;
  let last   = 0;

  function animate(ts) {
    if (ts - last > 1000 / fps) {
      drawGrain();
      last = ts;
    }
    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(animate);
}


/* ----------------------------------------------------------------
   2. スクロールリビール
   .reveal クラスの要素がビューポートに入ると .revealed を付与。
   同一セクション内の要素を 80ms ずつずらしてスタガー表示します。
   ---------------------------------------------------------------- */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        /* 同じパネル内の兄弟要素のインデックスを取得してスタガー遅延 */
        const parent   = entry.target.closest('[class*="__"]:not(.reveal)') || entry.target.parentElement;
        const siblings = [...parent.querySelectorAll('.reveal:not(.revealed)')];
        const idx      = siblings.indexOf(entry.target);
        const delay    = Math.max(0, idx) * 80;

        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);

        observer.unobserve(entry.target);
      });
    },
    {
      threshold:  0.10,
      rootMargin: '0px 0px -35px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}


/* ----------------------------------------------------------------
   3. ナビゲーション挙動
   - 80px スクロール: .scrolled → ガラス背景を表示
   - 下スクロール 200px 超: .hidden → ナビを上に隠す
   - 上スクロール: .hidden 削除 → ナビを再表示
   ---------------------------------------------------------------- */
function initNavBehavior() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  let lastY = 0;

  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;

      nav.classList.toggle('scrolled', y > 80);

      if (y > lastY && y > 200) {
        nav.classList.add('hidden');
      } else {
        nav.classList.remove('hidden');
      }

      lastY = y;
    },
    { passive: true }
  );
}


/* ----------------------------------------------------------------
   4. モバイルメニュー
   ハンバーガーボタンのタップでナビを開閉します。
   ナビリンクをクリックすると自動で閉じます。
   ---------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  /* リンククリックでメニューを閉じる */
  menu.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ----------------------------------------------------------------
   5. Hero パララックス
   スクロール量の 35% 分だけ Hero 背景を下方向にずらし、
   奥行き感（パララックス効果）を演出します。
   requestAnimationFrame でバッチ処理してパフォーマンスを維持。
   ---------------------------------------------------------------- */
function initParallax() {
  const heroBg = document.querySelector('.hero__bg');
  if (!heroBg) return;

  const FACTOR  = 0.35;
  let ticking   = false;

  function update() {
    heroBg.style.transform = `translateY(${window.scrollY * FACTOR}px) scale(1.07)`;
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
}
