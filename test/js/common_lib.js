/* jQuery 3.6.0 が index.html で読み込まれている前提 */

$(function() {
    // ===== ユーティリティ関数 =====
    // デバウンス処理（高頻度イベントの最適化）
    const debounce = (func, wait) => {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // 1. ドロワーメニュー (ハンバーガーメニュー) の開閉処理
    const $hMenu = $('#hMenu');
    const $rmenu = $('#rmenu');
    const $mask = $('#mask');
    const $body = $('body');

    // ハンバーガーボタンをクリックした時
    $hMenu.on('click', function() {
        // メニューの開閉クラスをトグル
        $hMenu.toggleClass('is-active');
        $rmenu.toggleClass('is-active');
        $mask.toggleClass('is-active');
        $body.toggleClass('is-noscroll'); // 背景のスクロールを禁止
    });

    // ドロワーメニューを閉じるイベント (リンククリック、マスククリック)
    $('#rmenu a, #mask, #rmenuClose').on('click', function() {
        $hMenu.removeClass('is-active');
        $rmenu.removeClass('is-active');
        $mask.removeClass('is-active');
        $body.removeClass('is-noscroll');
    });

    // 2. スムーズスクロール (ページ内リンク)
    // #から始まるaタグ（#のみは除く）がクリックされた時に実行
    $('a[href^="#"]').not('a[href="#"]').on('click', function(e){
        const target = $(this).attr("href");
        const speed = 500;
        
        // スクロール対象が存在するかチェック
        if (target === '#pagetop' || $(target).length === 0) {
            // ターゲットがpagetopまたは存在する場合のみ処理
            if ($(target).length === 0 && target !== '#pagetop') {
                return true; // 対象が存在しない場合はデフォルト動作
            }
        } else {
            e.preventDefault();
        }
        
        // 固定ヘッダーの高さ分を考慮してスクロール位置を調整
        const headerHeight = $('header').outerHeight() || 0; 
        
        // スクロール先の位置を計算 (ページのトップなら0、それ以外は要素の位置 - ヘッダーの高さ)
        const position = (target === '#pagetop') ? 0 : $(target).offset().top - headerHeight;
        
        // 既に実行中のアニメーションをストップして新しいアニメーションを開始
        $("html, body").stop().animate({scrollTop: position}, speed, 'swing');
        return false;
    });

    // 3. ページトップボタン (.f_scroll) の表示制御
    const $fScroll = $('.f_scroll');
    const displayThreshold = 400; // 400pxスクロールしたら表示

    // スクロールイベントをデバウンス処理（パフォーマンス最適化）
    const handleScroll = debounce(() => {
        if ($(window).scrollTop() > displayThreshold) {
            $fScroll.fadeIn(300);
        } else {
            $fScroll.fadeOut(300);
        }
    }, 100);

    $(window).on('scroll', handleScroll);

    // 4. MVのvh (Viewport Height) 対策
    // スマホでアドレスバーが出た際にvhがずれるのを修正 (元のHPのHTMLにあった --vh に対応)
    const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    
    // resizeとorientationchangeイベントにもデバウンス処理を適用
    const handleResize = debounce(setVh, 100);
    $(window).on('resize orientationchange', handleResize);

    // 5. スクロール時の背景色動的変化（スムーズな補間）
    // 各セクションの中心位置に基づき、現在のビューポート中心がどの区間にあるかを求め
    // 隣接するセクション間で線形補間して背景色を滑らかに変化させる
    const colorMap = {
        'bg-white': '#ffffff',
        'bg-navy-blue': '#1F3A52',
        'bg-deep-navy': '#0f2340',
        'bg-gold': '#C9A961',
        'bg-emerald': '#2a9d8f',
        'bg-charcoal': '#2f2f2f',
        'bg-slate': '#5B6D7A',
        'bg-ivory': '#F6EFE6',
        'bg-bronze': '#B08D57'
    };

    const fontColorMap = {
        '#ffffff': '#4d4d4d', // default mapping (not used directly)
    };

    const hexToRgb = (hex) => {
        hex = hex.replace('#','');
        if (hex.length === 3) hex = hex.split('').map(h=>h+h).join('');
        const bigint = parseInt(hex, 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    };

    const rgbToHex = (r,g,b) => {
        return '#' + [r,g,b].map(v => { const s = v.toString(16); return s.length==1? '0'+s : s; }).join('');
    };

    const lerp = (a,b,t) => Math.round(a + (b - a) * t);

    let sections = [];
    const buildSections = () => {
        sections = [];
        $('.top_mv, article, footer').each(function(){
            const el = this;
            const rect = el.getBoundingClientRect();
            const centerPageY = window.scrollY + rect.top + rect.height/2;
            // find class key
            let key = null;
            Object.keys(colorMap).some(k => { if ($(el).hasClass(k)) { key = k; return true;} return false; });
            if (!key) key = 'bg-white';
            sections.push({el, centerPageY, color: colorMap[key], fontColor: (key==='bg-ivory' ? '#2f2f2f' : (key==='bg-gold' ? '#1F3A52' : (key==='bg-ivory' ? '#2f2f2f' : '#ffffff')))});
        });
        // sort by centerPageY
        sections.sort((a,b)=>a.centerPageY - b.centerPageY);
    };

    buildSections();

    let needsUpdate = true;
    let rafId = null;

    const updateBlend = () => {
        needsUpdate = false;
        const viewportCenter = window.scrollY + window.innerHeight/2;

        if (sections.length === 0) return;

        // if before first or after last
        if (viewportCenter <= sections[0].centerPageY) {
            document.documentElement.style.setProperty('--scroll-bg-color', sections[0].color);
            document.documentElement.style.setProperty('--scroll-font-color', sections[0].fontColor || '#4d4d4d');
            return;
        }
        if (viewportCenter >= sections[sections.length-1].centerPageY) {
            const last = sections[sections.length-1];
            document.documentElement.style.setProperty('--scroll-bg-color', last.color);
            document.documentElement.style.setProperty('--scroll-font-color', last.fontColor || '#4d4d4d');
            return;
        }

        // find surrounding sections
        let i = 0;
        while (i < sections.length - 1 && viewportCenter > sections[i+1].centerPageY) i++;
        const A = sections[i];
        const B = sections[i+1];
        const span = B.centerPageY - A.centerPageY;
        const t = span === 0 ? 0 : Math.min(Math.max((viewportCenter - A.centerPageY) / span, 0), 1);

        const ca = hexToRgb(A.color);
        const cb = hexToRgb(B.color);
        const cr = lerp(ca[0], cb[0], t);
        const cg = lerp(ca[1], cb[1], t);
        const cbv = lerp(ca[2], cb[2], t);
        const blended = rgbToHex(cr,cg,cbv);

        // font color: simple pick based on t (could be improved)
        const fa = A.fontColor || (A.color === '#ffffff' ? '#4d4d4d' : '#ffffff');
        const fb = B.fontColor || (B.color === '#ffffff' ? '#4d4d4d' : '#ffffff');
        // convert to rgb
        const fA = hexToRgb(fa.replace('#','')) || hexToRgb(fa.replace('#',''));
        const fB = hexToRgb(fb.replace('#','')) || hexToRgb(fb.replace('#',''));
        const fr = lerp(fA[0], fB[0], t);
        const fg = lerp(fA[1], fB[1], t);
        const fb2 = lerp(fA[2], fB[2], t);
        const fBlended = rgbToHex(fr,fg,fb2);

        document.documentElement.style.setProperty('--scroll-bg-color', blended);
        document.documentElement.style.setProperty('--scroll-font-color', fBlended);
    };

    const scheduleUpdate = () => {
        if (!needsUpdate) {
            needsUpdate = true;
            rafId = requestAnimationFrame(() => {
                updateBlend();
                needsUpdate = false;
            });
        }
    };

    $(window).on('scroll', scheduleUpdate);
    $(window).on('resize', () => { buildSections(); scheduleUpdate(); });


    // 6. リップルエフェクト (タッチ・クリックで波紋が広がる)
    const createRipple = (e) => {
        const $ripple = $('<span class="ripple"></span>');
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.pageX || e.touches[0].pageX - $(window).scrollLeft();
        const y = e.pageY || e.touches[0].pageY - $(window).scrollTop();

        // リップル位置を計算
        const offsetX = x - rect.left;
        const offsetY = y - rect.top;

        $ripple.css({
            left: offsetX + 'px',
            top: offsetY + 'px',
            marginLeft: '-150px',
            marginTop: '-150px'
        });

        $(e.currentTarget).css('position', 'relative').append($ripple);

        // アニメーション完了後に要素を削除
        setTimeout(() => {
            $ripple.remove();
        }, 600);
    };

    // ドキュメント全体にリップルエフェクトを適用
    $(document).on('click touchstart', function(e) {
        // ボタンやインタラクティブ要素でのみ効果を発動
        if (!$(e.target).closest('[role="button"], button, a, input, select, textarea').length &&
            !$(e.target).is('[role="button"], button, a, input, select, textarea')) {
            createRipple(e);
        }
    });
});