document.addEventListener("DOMContentLoaded", function () {
    const images = [
        'backgrounds/background.png',
        'backgrounds/background2.png',
        'backgrounds/background3.png',
        'backgrounds/background4.png',
        'backgrounds/background5.png',
        'backgrounds/background6.png',

    ];
    let currentIndex = 0;
    const container = document.getElementById('background-container');

    function changeBackground() {
        container.style.backgroundImage = `url(${images[currentIndex]})`;
        currentIndex = (currentIndex + 1) % images.length;
    }

    setInterval(changeBackground, 5000); // 每5秒切换一次背景
    changeBackground(); // 初始化背景
});