const JsBridge = function() {
    this.win = window;
    this.iOS = false;

    this.init();
}

JsBridge.prototype = {
    init: function() {
        this.iOS = ! /android/.test(this.win.navigator.userAgent.toLowerCase());
    },

    iOSHandler: function(method, params, cb) {
        this.setupWebViewJavascriptBridge(function(bridge) {
            bridge.callHandler(method, params, function (responseData) {
                typeof cb === 'function' && cb.apply(this.win, arguments);
            });
        });
    },

    androidHandler: function(method, params, cb) {
        this.win.WebViewJavascriptBridge.callHandler(
            method, params,
            function(responseData) {
                typeof cb === 'function' && cb.apply(this.win, arguments);
            }
        );
    },

    /**
        调用客户端方法
        method: 方法名
        params: 参数
        cb：回调函数
    */
    exec: function(method, params, cb) {
        params = params || {};
        try {
            this.iOS ?
                this.iOSHandler(method, params, cb) :
                this.androidHandler(method, params, cb);
        } catch (e) {
            console.warn(e);
        }
    },


    setupWebViewJavascriptBridge: function(callback) {
        if (this.win.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
        if (this.win.WVJBCallbacks) { return this.win.WVJBCallbacks.push(callback); }
        this.win.WVJBCallbacks = [callback];
        const WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'https://__bridge_loaded__';
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
    },

    iOSAddEvent: function(method, handler) {
        this.setupWebViewJavascriptBridge(function(bridge) {
            bridge.registerHandler(method, function(data, responseCallback) {
                responseCallback(data);
                typeof handler === 'function' && handler.apply(this.win, arguments);
            })
        })
    },

    connectWebViewJavascriptBridge: function(callback) {
        if (this.win.WebViewJavascriptBridge) {
            typeof callback === 'function' && callback.call(this.win, this.win.WebViewJavascriptBridge);
        } else {
            document.addEventListener('WebViewJavascriptBridgeReady', function() {
                typeof callback === 'function' && callback.call(this.win, this.win.WebViewJavascriptBridge);
            },false);
        }
    },

    androidAddEvent: function(method, handler) {
        this.connectWebViewJavascriptBridge(function(bridge) {
            try {
                if (!this.win.WebViewJavascriptBridge._messageHandler) {
                    bridge.init(function(message, responseCallback) {
                        responseCallback(data);
                    });
                }
            } catch (e) {
                console.warn(e);
            }

            bridge.registerHandler(method, function(data, responseCallback) {
                responseCallback(data);
                typeof handler === 'function' && handler.apply(this.win, arguments);
            });

        });
    },


    /**
        添加客户端可调用方法
        method: 客户端调用方法名,
        handler：函数体
    */
    addEventListener: function(method, handler) {
        try {
            this.iOS ? 
                this.iOSAddEvent(method, handler) :
                this.androidAddEvent(method, handler);
        } catch (e) {
            console.warn(e);
        }
    }
}