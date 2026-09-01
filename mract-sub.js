/**
 * mract 固定订阅输出
 */

const STORAGE_KEY = "MRACT_SUBSCRIPTION";

const content = $persistentStore.read(STORAGE_KEY);

if (!content || content.trim() === "") {

  $done({
    response: {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      },
      body: "No Subscription"
    }
  });

} else {

  $done({
    response: {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache"
      },
      body: content
    }
  });

}