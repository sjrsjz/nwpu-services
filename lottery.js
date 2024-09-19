// lottery.js 文件
var websocket; // 将 websocket 提升到全局作用域

document.addEventListener('DOMContentLoaded', function () {
    var wsUri = 'wss://api.u1094922.nyat.app:39479/ws/nwpu-services';

    if ('WebSocket' in window) {
        websocket = new WebSocket(wsUri);

        websocket.onopen = function (evt) {
            console.log("连接成功");
        };

        websocket.onerror = function (evt) {
            console.error("错误发生：" + evt.data);
        };

        websocket.onmessage = function (evt) {
            console.log("接收到的消息：" + evt.data);
            handleServerResponse(evt.data);
        };

        websocket.onclose = function (evt) {
            console.log("连接已关闭...");
        };
    } else {
        alert('您的浏览器不支持WebSocket');
    }
});

function joinLottery(name_str) {
    if (!name_str.trim()) {
        alert('请输入您的名字！');
        return;
    }
    websocket.send(JSON.stringify({ type: 'RAND', name: name_str }));
}

function handleServerResponse(data) {
    var resultElement = document.getElementById('result');
    try {
        var response = JSON.parse(data);
        if (response.type === 'RAND') {
            resultElement.innerHTML = response.rand_num;
        } else {
            console.error('未知的服务器响应：', response);
        }

    } catch (e) {
        console.error('处理服务器响应时出错：', e);
    }
}