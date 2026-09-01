/**
 * Anyun VPN
 * 自动注册 + 获取节点 + 写入 Loon 本地存储
 */

var STORAGE_KEY = "MRACT_SUBSCRIPTION";
var TIME_KEY = "MRACT_SUBSCRIPTION_TIME";

var BASE_URL = "https://api.anyunvpn.com";

var USER_AGENT =
    "evvpn/7 CFNetwork/1402.0.8 Darwin/22.2.0";

var DEVICE_NAME = "iPhone13,4";
var OS_VERSION = "16.2";
var DEVICE_TYPE = "ios";


function generateDeviceUid() {

    var result = "";

    for (var i = 0; i < 32; i++) {

        result += Math.floor(
            Math.random() * 16
        ).toString(16);

    }

    return result;
}


function httpRequest(options) {

    return new Promise(function(resolve, reject) {

        var method =
            options.method || "GET";

        var request = {

            url: options.url,

            headers:
                options.headers || {}

        };

        if (
            options.body !== undefined
        ) {

            request.body =
                options.body;

        }


        var callback =
            function(
                error,
                response,
                body
            ) {

                if (error) {

                    reject(error);

                    return;

                }

                var data = body;

                try {

                    data =
                        JSON.parse(body);

                } catch (e) {

                    data = body;

                }

                resolve({

                    response:
                        response,

                    body:
                        body,

                    data:
                        data

                });

            };


        if (
            method === "POST"
        ) {

            $httpClient.post(
                request,
                callback
            );

        } else if (
            method === "PUT"
        ) {

            $httpClient.put(
                request,
                callback
            );

        } else if (
            method === "PATCH"
        ) {

            $httpClient.patch(
                request,
                callback
            );

        } else {

            $httpClient.get(
                request,
                callback
            );

        }

    });

}


(async function() {

    try {

        console.log(
            "================================"
        );

        console.log(
            "Anyun VPN 自动更新开始"
        );

        console.log(
            "================================"
        );


        // ============================================
        // 读取插件参数
        // ============================================

        var argument =
            $argument || {};

        var subscriptionName =
            argument.subscriptionName ||
            "mract";


        console.log(
            "订阅名称：" +
            subscriptionName
        );


        // ============================================
        // 生成随机 UID
        // ============================================

        var deviceUid =
            generateDeviceUid();


        console.log(
            "设备 UID：" +
            deviceUid
        );


        // ============================================
        // 登录
        // ============================================

        var loginHeaders = {

            "Accept":
                "application/json",

            "Content-Type":
                "application/json",

            "User-Agent":
                USER_AGENT,

            "Accept-Language":
                "zh-CN,zh-Hans;q=0.9",

            "Connection":
                "keep-alive",

            "Accept-Encoding":
                "gzip, deflate, br",

            "Host":
                "api.anyunvpn.com"

        };


        var loginBody =
            JSON.stringify({

                deviceName:
                    DEVICE_NAME,

                deviceUid:
                    deviceUid,

                osVersion:
                    OS_VERSION,

                deviceType:
                    DEVICE_TYPE

            });


        var loginResult =
            await httpRequest({

                url:
                    BASE_URL +
                    "/api/user/auth/deviceLogin",

                method:
                    "POST",

                headers:
                    loginHeaders,

                body:
                    loginBody

            });


        var loginResp =
            loginResult.data;


        if (
            !loginResp ||
            loginResp.code !== 200 ||
            !loginResp.data ||
            !loginResp.data.token
        ) {

            throw new Error(
                "登录失败：" +
                JSON.stringify(loginResp)
            );

        }


        var token =
            loginResp.data.token;


        console.log(
            "✅ Anyun 登录成功"
        );


        // ============================================
        // 节点列表
        // ============================================

        var nodeHeaders = {

            "Accept":
                "application/json",

            "X-Token":
                token,

            "Content-Type":
                "application/json",

            "User-Agent":
                USER_AGENT,

            "Accept-Language":
                "zh-CN,zh-Hans;q=0.9",

            "Connection":
                "keep-alive",

            "Accept-Encoding":
                "gzip, deflate, br",

            "Host":
                "api.anyunvpn.com",

            "x-platform":
                "ios"

        };


        var nodeResult =
            await httpRequest({

                url:
                    BASE_URL +
                    "/api/user/node/nodeList",

                method:
                    "POST",

                headers:
                    nodeHeaders,

                body:
                    ""

            });


        var nodeResp =
            nodeResult.data;


        if (
            !nodeResp ||
            nodeResp.code !== 200 ||
            !nodeResp.data ||
            !Array.isArray(
                nodeResp.data.nodes
            )
        ) {

            throw new Error(
                "获取节点列表失败：" +
                JSON.stringify(nodeResp)
            );

        }


        var nodes =
            nodeResp.data.nodes;


        console.log(
            "✅ 获取到 " +
            nodes.length +
            " 个节点"
        );


        // ============================================
        // 获取节点链接
        // ============================================

        var links = [];


        for (
            var i = 0;
            i < nodes.length;
            i++
        ) {

            var node =
                nodes[i];


            try {

                var connectResult =
                    await httpRequest({

                        url:
                            BASE_URL +
                            "/api/user/node/connect",

                        method:
                            "POST",

                        headers:
                            nodeHeaders,

                        body:
                            JSON.stringify({

                                nodeId:
                                    node.id

                            })

                    });


                var connectResp =
                    connectResult.data;


                if (
                    connectResp &&
                    connectResp.code === 200 &&
                    connectResp.data &&
                    Array.isArray(
                        connectResp.data.links
                    )
                ) {

                    for (
                        var j = 0;
                        j <
                        connectResp.data.links.length;
                        j++
                    ) {

                        var link =
                            connectResp.data.links[j];


                        if (
                            typeof link === "string" &&
                            link.trim() !== ""
                        ) {

                            links.push(
                                link.trim()
                            );

                        }

                    }


                    console.log(
                        "✅ " +
                        (
                            node.nodeName ||
                            ("节点-" + (i + 1))
                        ) +
                        " 获取成功"
                    );

                }

            } catch (e) {

                console.log(
                    "❌ 节点获取异常：" +
                    String(e)
                );

            }

        }


        // ============================================
        // 去重
        // ============================================

        var uniqueLinks = [];


        for (
            var x = 0;
            x < links.length;
            x++
        ) {

            if (
                uniqueLinks.indexOf(
                    links[x]
                ) === -1
            ) {

                uniqueLinks.push(
                    links[x]
                );

            }

        }


        // ============================================
        // 防止空节点覆盖旧节点
        // ============================================

        if (
            uniqueLinks.length === 0
        ) {

            throw new Error(
                "没有获取到节点，取消覆盖旧订阅"
            );

        }


        var content =
            uniqueLinks.join("\n");


        console.log(
            "================================"
        );

        console.log(
            "✅ 共获得 " +
            uniqueLinks.length +
            " 个节点"
        );

        console.log(
            "新内容长度：" +
            content.length
        );


        // ============================================
        // 保存
        // ============================================

        var saved =
            $persistentStore.write(
                content,
                STORAGE_KEY
            );


        if (!saved) {

            throw new Error(
                "persistentStore 写入失败"
            );

        }


        console.log(
            "✅ persistentStore 写入成功"
        );


        // ============================================
        // 写入时间
        // ============================================

        $persistentStore.write(
            String(Date.now()),
            TIME_KEY
        );


        // ============================================
        // 写入验证
        // ============================================

        var verify =
            $persistentStore.read(
                STORAGE_KEY
            );


        if (
            !verify ||
            verify.trim() !==
            content.trim()
        ) {

            throw new Error(
                "写入验证失败"
            );

        }


        console.log(
            "✅ 写入验证成功"
        );


        console.log(
            "================================"
        );

        console.log(
            "订阅：" +
            subscriptionName
        );

        console.log(
            "节点：" +
            uniqueLinks.length
        );

        console.log(
            "状态：更新成功"
        );

        console.log(
            "================================"
        );


        $notification.post(
            "Anyun VPN",
            "节点更新成功",
            uniqueLinks.length +
            " 个节点"
        );


    } catch (e) {

        console.log(
            "================================"
        );

        console.log(
            "❌ Anyun 更新失败"
        );

        console.log(
            String(e)
        );

        console.log(
            "================================"
        );


        $notification.post(
            "Anyun VPN",
            "更新失败",
            String(e)
        );

    }


    $done();

})();