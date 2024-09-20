var websocket;

let initWebSocket = () => {
    var wsUri = 'wss://api.u1094922.nyat.app:39479/ws/nwpu-services/lottery';

    if ('WebSocket' in window) {
        websocket = new WebSocket(wsUri);

        websocket.onopen = function () {
            console.log("连接成功");
        };

        websocket.onerror = function (evt) {
            console.error("错误发生：" + evt.data);
            handleConnectionError();
        };

        websocket.onmessage = function (evt) {
            console.log("接收到的消息：" + evt.data);
            handleServerResponse(evt.data);
        };

        websocket.onclose = function () {
            console.log("连接已关闭...");
            handleConnectionClose();
        };
    } else {
        alert('您的浏览器不支持WebSocket');
    }
};

document.addEventListener('DOMContentLoaded', function () {
    initWebSocket();
}, false);

function triggerShakeEffect() {
    const container = document.getElementById('container');

    // 移除shake类，然后通过requestAnimationFrame立即重新添加类，重置动画
    container.classList.remove('shake');

    // 确保下一帧才重新添加shake类，避免瞬间闪动
    requestAnimationFrame(() => {
        container.classList.add('shake');
    });
}

function joinLottery() {
    var resultElement = document.getElementById('result');
    resultElement.innerHTML = '';
    const name_str = document.getElementById('name').value.trim();
    const container = document.getElementById('container');

    if (!name_str) {

        // 触发震动效果
        triggerShakeEffect();

        return;
    }

    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
        alert('连接尚未建立，请稍后再试。');
        initWebSocket();
        return;
    }

    websocket.send(JSON.stringify({ type: 'RAND', name: name_str }));
}


function handleServerResponse(data) {
    var resultElement = document.getElementById('result');

    if (!resultElement) {
        console.error('未能找到结果元素。');
        return;
    }

    try {
        var response = JSON.parse(data);

        if (response.type === 'RAND') {
            if (typeof response.rand_num === 'number') {
                resultElement.innerHTML = "恭喜！您抽中的数字是：" + response.rand_num;
            } else {
                resultElement.innerHTML = "服务器返回的数据格式错误，请稍后再试。";
                console.error('RAND类型响应中rand_num不是数字');
            }
        } else {
            console.error('未知的服务器响应：', response);
            resultElement.innerHTML = "服务器返回的数据格式错误，请稍后再试。";
        }

    } catch (e) {
        console.error('处理服务器响应时出错：', e);
        resultElement.innerHTML = "服务器返回的数据格式错误，请稍后再试。";
    }
}

function handleConnectionError() {
    console.error("WebSocket连接出现错误。");
    alert('连接出现问题，请检查网络或稍后再试。');
}

function handleConnectionClose() {
    console.log("WebSocket连接已关闭。");
    alert('连接已断开，请刷新页面重新开始。');
}

function addRippleEffect(event) {
    const container = event.currentTarget;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    container.appendChild(ripple);

    const rect = container.getBoundingClientRect();
    const rippleSize = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = rippleSize + 'px';
    ripple.style.left = (event.clientX - rect.left - rippleSize / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - rippleSize / 2) + 'px';

    setTimeout(() => {
        ripple.remove();
    }, 1000);
}


function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}


function joinLottery() {
    var resultElement = document.getElementById('result');
    resultElement.innerHTML = '';
    const name_str = document.getElementById('name').value.trim();
    const container = document.getElementById('container');

    if (!name_str) {
        // 触发震动效果
        triggerShakeEffect();
        return;
    }

    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
        alert('连接尚未建立，请稍后再试。');
        initWebSocket();
        return;
    }

    websocket.send(JSON.stringify({ type: 'RAND', name: name_str }));
}