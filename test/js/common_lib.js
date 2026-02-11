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
});