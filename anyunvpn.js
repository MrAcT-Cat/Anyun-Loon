const STORAGE_KEY = "MRACT_SUBSCRIPTION";

const BASE_URL = "https://api.anyunvpn.com";

const USER_AGENT =
  "evvpn/7 CFNetwork/1402.0.8 Darwin/22.2.0";

function uid() {
  return Array.from(
    { length: 32 },
    () =>
      Math.floor(
        Math.random() * 16
      ).toString(16)
  ).join("");
}

function request(opt) {

  return new Promise(
    (resolve, reject) => {

      const cb = (
        err,
        resp,
        body
      ) => {

        if (err) {

          reject(err);

        } else {

          try {

            resolve(
              JSON.parse(body)
            );

          } catch {

            resolve(body);

          }

        }

      };

      if (
        opt.method === "POST"
      ) {

        $httpClient.post(opt, cb);

      } else {

        $httpClient.get(opt, cb);

      }

    }
  );

}

(async () => {

  try {

    const loginResp =
      await request({

        url:
          BASE_URL +
          "/api/user/auth/deviceLogin",

        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          "User-Agent":
            USER_AGENT

        },

        body:
          JSON.stringify({

            deviceName:
              "iPhone",

            deviceUid:
              uid(),

            osVersion:
              "16.2",

            deviceType:
              "ios"

          })

      });

    const token =
      loginResp.data.token;

    const nodeResp =
      await request({

        url:
          BASE_URL +
          "/api/user/node/nodeList",

        method: "POST",

        headers: {

          "X-Token":
            token,

          "User-Agent":
            USER_AGENT

        },

        body: ""

      });

    const nodes =
      nodeResp.data.nodes;

    let links = [];

    for (
      const node of nodes
    ) {

      const connectResp =
        await request({

          url:
            BASE_URL +
            "/api/user/node/connect",

          method:
            "POST",

          headers: {

            "X-Token":
              token,

            "User-Agent":
              USER_AGENT,

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              nodeId:
                node.id

            })

        });

      if (
        connectResp.code === 200
      ) {

        links.push(
          ...connectResp.data.links
        );

      }

    }

    links = [
      ...new Set(links)
    ];

    const content =
      links.join("\n");

    $persistentStore.write(
      content,
      STORAGE_KEY
    );

    $notification.post(
      "Anyun",
      "更新成功",
      `${links.length} 个节点`
    );

  } catch (e) {

    $notification.post(
      "Anyun",
      "更新失败",
      String(e)
    );

  }

  $done();

})();