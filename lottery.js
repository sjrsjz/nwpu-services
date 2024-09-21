var websocket;
const probability = 0.25;
const baseUri = 'api.u1094922.nyat.app:43333';
let initWebSocket = () => {
    var wsUri = `wss://${baseUri}/ws/nwpu-services/lottery`;

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

class ws_warpper {
    constructor() {
        this.ws = this.initWSWarpper();
        this.callbacks = {};
        this.messageId = 0;
        this.isConnected = false;
        this.queue = [];

        this.ws.onmessage = (evt) => {
            const message = JSON.parse(evt.data);
            const { id, data, error } = message;
            if (this.callbacks[id]) {
                if (error) {
                    this.callbacks[id].reject(error);
                } else {
                    this.callbacks[id].resolve(data);
                }
                delete this.callbacks[id];
            }
        };

        this.ws.onerror = (evt) => {
            console.error("错误发生：" + evt.data);
            Object.values(this.callbacks).forEach(callback => callback.reject(evt.data));
            this.callbacks = {};
        };

        this.ws.onclose = () => {
            console.log("连接已关闭...");
            Object.values(this.callbacks).forEach(callback => callback.reject("连接已关闭"));
            this.callbacks = {};
        };

        this.ws.onopen = () => {
            this.isConnected = true;
            this.queue.forEach(({ type, url, headers, body, resolve, reject }) => {
                this.sendRequest(type, url, headers, body).then(resolve).catch(reject);
            });
            this.queue = [];
        };
    }

    initWSWarpper() {
        const wsUri = `wss://${baseUri}/ws/ws-warpper`;

        if ('WebSocket' in window) {
            const ws = new WebSocket(wsUri);

            ws.onopen = () => {
                console.log("连接成功");
            };

            return ws;
        } else {
            alert('您的浏览器不支持WebSocket');
        }
    }

    sendRequest(type, url, headers, body) {
        return new Promise((resolve, reject) => {
            const id = this.messageId++;
            this.callbacks[id] = { resolve, reject };

            if (this.isConnected) {
                this.ws.send(JSON.stringify({ id, type, url, headers, body }));
            } else {
                this.queue.push({ type, url, headers, body, resolve, reject });
            }
        });
    }

    post(url, headers, body) {
        return this.sendRequest('POST', url, headers, body);
    }

    get(url, headers) {
        return this.sendRequest('GET', url, headers);
    }
}

var showResult = false;

class NWPUStudent {
    constructor(baseUri) {
        this.baseUri = baseUri;
        this.websocket = null;

        this.initWebSocket();
    }

    initWebSocket() {
        var wsUri = `wss://${this.baseUri}/ws/nwpu-services/login`;

        if ('WebSocket' in window) {
            this.websocket = new WebSocket(wsUri);

            this.websocket.onopen = () => {
                console.log("连接成功");
            };

            this.websocket.onerror = (evt) => {
                console.error("错误发生：" + evt.data);
                this.handleConnectionError();
            };

            this.websocket.onmessage = (evt) => {
                console.log("接收到的消息：" + evt.data);
                this.handleServerResponse(evt.data);
            };

            this.websocket.onclose = () => {
                console.log("连接已关闭...");
                setTimeout(() => { }, 1000);
            };
        } else {
            alert('您的浏览器不支持WebSocket');
        }
    }

    handleServerResponse(data) {
        let message = JSON.parse(data);
        switch (message.type) {
            case "qr_image":
                this.displayQRCode(message.image);
                break;
            case "login_success":
                this.handleLoginSuccess(message);
                break;
            case "wait_for_confirm":
                this.waitForComfirm();
                break;
            case "cancel_login":
                this.cancelLogin();
                break;
            case "qr_code_expired":
                this.cancelLogin();
                console.log("二维码已过期，已重试。");
                break;
            case "error":
                console.error("服务器错误：" + message.message);
                this.handleServerError();
                break;
            default:
                console.warn("未知消息类型：" + message.type);
        }
    }

    displayQRCode(image) {
        // 显示二维码的逻辑
        console.log("显示二维码：" + image);

        // 寻找 "scan" 元素
        let scanElement = document.getElementById("scan");
        if (!scanElement) {
            console.error("未找到元素：scan");
            return;
        }
        // base64
        var base64 = 'data:image/png;base64,' + image;
        scanElement.innerHTML = `<img src="${base64}" alt="二维码" id="qrCode" class="qrCode">`;
    }

    handleLoginSuccess(message) {
        // 处理登录成功的逻辑
        console.log("登录成功");
        let scanElement = document.getElementById("scan");
        if (!scanElement) {
            console.error("未找到元素：scan");
            return;
        }
        showResult = true;
        scanElement.innerHTML = `<h2># 登录成功 #</h2>`;
        
        setTimeout(() => {
        }, 1000);

        if (message.rand_num/100.0 < probability) {
            scanElement.innerHTML += '<h2>姓名：' + message.name + '</h2>';
            scanElement.innerHTML += '<h2>恭喜您，中奖了！(≧∇≦)ﾉ</h2>';
            scanElement.innerHTML += '<h2>您的幸运数字是：' + message.rand_num + '</h2>';
        }
        else {
            scanElement.innerHTML += '<h2>姓名：' + message.name + '</h2>';
            scanElement.innerHTML += '<h2>很遗憾，未中奖。(っ °Д °;)っ</h2>';
            scanElement.innerHTML += '<h2>您的数字是：' + message.rand_num + '</h2>';
        }
        // 显示结果
        //scanElement.innerHTML += '<p>您的学号：' + message.uid + '</p>';
        //scanElement.innerHTML += '<p>您的姓名：' + message.name + '</p>';
        //scanElement.innerHTML += '<p>您的RAND：' + message.rand_num + '</p>';
        // 加入一个确认按钮
        scanElement.innerHTML += '<button onclick="confirmRand()">继续</button>';
    }

    handleConnectionError() {
        // 连接错误处理逻辑
        console.error("WebSocket连接错误，尝试重新连接...");
        setTimeout(() => { }, 5000);
        this.initWebSocket(); // 尝试重新建立连接
    }

    handleConnectionClose() {
        // 连接关闭处理逻辑
        console.log("WebSocket连接关闭，尝试重新连接...");
        this.initWebSocket(); // 尝试重新建立连接
    }
    handleServerError() {
        // 服务器错误处理逻辑
        this.cancelLogin();
        setTimeout(() => {
            this.initWebSocket();
        }, 1000);
    }
    waitForComfirm() {
        // 等待确认逻辑
        console.log("等待确认...");
        let scanElement = document.getElementById("scan");
        if (!scanElement) {
            console.error("未找到元素：scan");
            return;
        }
        scanElement.innerHTML = `<h2># 等待登录 #</h2>`;
        // 动效
        triggerShakeEffect();
    }
    cancelLogin() {
        console.log("取消登录...");

        // 关闭 WebSocket 连接
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        // 清理 UI 元素
        let scanElement = document.getElementById("scan");
        if (scanElement) {
            scanElement.innerHTML = `<h2>登录已取消</h2>`;
        }

        // 重新初始化 WebSocket
        setTimeout(() => {
            if (!showResult) {
                this.initWebSocket();                
            }
        }, 1000);
    }

}

function confirmRand() {
    showResult = false;
    waitForLogin();
}

document.addEventListener('DOMContentLoaded', function () {
    initWebSocket();
    changeMode();
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
                if (response.rand_num/100.0 < probability) {
                    resultElement.innerHTML = '恭喜您，中奖了！(≧∇≦)ﾉ<br>您的幸运数字是：' + response.rand_num;
                } else {
                    resultElement.innerHTML = '很遗憾，未中奖。(っ °Д °;)っ<br>您的数字是：' + response.rand_num;
                }
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
    setTimeout(() => {
    }, 1000);
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



function switchToQRCode() {
    const container = document.getElementById('container');
    container.innerHTML = `
        <h1>使用西工大APP扫码抽奖</h1>
        <div id="qrcode"></div>
        <div id="scan" class="scan"></div>
    `;
    waitForLogin();
}

function switchToLottery() {
    const container = document.getElementById('container');
    container.innerHTML = `
        <h1>欢迎参加抽奖活动！</h1>
        <input type="text" id="name" placeholder="请输入您的名字">
        <button onclick="joinLottery()">立即抽奖</button>
        <p id="result"></p>
    `;
}

var currMode = 'lottery';
function changeMode() {
    if (currMode === 'lottery') {
        currMode = 'qrcode';
        switchToQRCode();
    } else {
        currMode = 'lottery';
        switchToLottery();
    }
}

function waitForLogin() {
    var student = new NWPUStudent(baseUri);
}

window.changeMode = changeMode;
window.toggleFullScreen = toggleFullScreen;
window.addRippleEffect = addRippleEffect;
window.joinLottery = joinLottery;
window.handleServerResponse = handleServerResponse;
window.handleConnectionError = handleConnectionError;
window.handleConnectionClose = handleConnectionClose;
window.triggerShakeEffect = triggerShakeEffect;
window.initWebSocket = initWebSocket;
window.waitForLogin = waitForLogin;
window.switchToQRCode = switchToQRCode;
window.switchToLottery = switchToLottery;
window.NWPUStudent = NWPUStudent;
window.confirmRand = confirmRand;

export { NWPUStudent, addRippleEffect, changeMode, handleConnectionClose, handleConnectionError, handleServerResponse, initWebSocket, switchToLottery, switchToQRCode, toggleFullScreen, triggerShakeEffect, waitForLogin };