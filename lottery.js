// lottery.js 文件
var websocket; // 将 websocket 提升到全局作用域

let initWebSocket = () =>
    {
        var wsUri = 'wss://api.u1094922.nyat.app:39479/ws/nwpu-services';

        if ('WebSocket' in window) {
            websocket = new WebSocket(wsUri);

            websocket.onopen = function (evt) {
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

            websocket.onclose = function (evt) {
                console.log("连接已关闭...");
                handleConnectionClose();
            };
        } else {
            alert('您的浏览器不支持WebSocket');
        }
    }


document.addEventListener('DOMContentLoaded', function () {
    // 页面加载完成后初始化 WebSocket 连接
    initWebSocket();
}
    , false);

function joinLottery(name_str) {
    if (!name_str.trim()) {
        alert('请输入您的名字！');
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

    // 如果resultElement不存在，则直接返回，防止后续操作报错
    if (!resultElement) {
        console.error('未能找到结果元素。');
        return;
    }

    try {
        // 尝试解析数据
        var response = JSON.parse(data);

        // 检查response是否存在并且是一个对象
        if (!response || typeof response !== 'object') {
            throw new Error('无效的响应数据');
        }

        // 检查type是否存在
        if (response.type === 'RAND') {
            // 检查rand_num是否存在并且是数字
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
    // 处理WebSocket连接错误的情况
    console.error("WebSocket连接出现错误。");
    alert('连接出现问题，请检查网络或稍后再试。');
}

function handleConnectionClose() {
    // 处理WebSocket连接关闭的情况
    console.log("WebSocket连接已关闭。");
    alert('连接已断开，请刷新页面重新开始。');
}