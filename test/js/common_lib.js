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

    // 5. スクロール時の背景色動的変化 (セクション別背景色の Intersection Observer)
    // セクションが viewport に入ると自動的に背景色が変わる
    const observerOptions = {
        threshold: 0.3 // セクションの30%が見えたら発動
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        // 可視領域が最大の要素を選んで背景色を決定する
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length === 0) return;

        let topEntry = visible.reduce((a, b) => (a.intersectionRatio > b.intersectionRatio ? a : b));
        const $section = $(topEntry.target);

        let bgColor = '#ffffff';
        let fontColor = '#4d4d4d';

        if ($section.hasClass('bg-white')) {
            bgColor = '#ffffff';
            fontColor = '#4d4d4d';
        } else if ($section.hasClass('bg-navy-blue')) {
            bgColor = '#1F3A52';
            fontColor = '#ffffff';
        } else if ($section.hasClass('bg-deep-navy')) {
            bgColor = '#0f2340';
            fontColor = '#ffffff';
        } else if ($section.hasClass('bg-gold')) {
            bgColor = '#C9A961';
            fontColor = '#1F3A52';
        } else if ($section.hasClass('bg-emerald')) {
            bgColor = '#2a9d8f';
            fontColor = '#ffffff';
        } else if ($section.hasClass('bg-charcoal')) {
            bgColor = '#2f2f2f';
            fontColor = '#ffffff';
        }

        document.documentElement.style.setProperty('--scroll-bg-color', bgColor);
        document.documentElement.style.setProperty('--scroll-font-color', fontColor);
    }, observerOptions);

    // セクション要素をすべて監視
    $('article, footer').each(function() {
        sectionObserver.observe(this);
    });

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