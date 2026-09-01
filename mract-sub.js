/**
 * MrAcT Anyun Subscription
 */

var STORAGE_KEY =
    "MRACT_SUBSCRIPTION";

var TIME_KEY =
    "MRACT_SUBSCRIPTION_TIME";


var content =
    $persistentStore.read(
        STORAGE_KEY
    );


var updateTime =
    $persistentStore.read(
        TIME_KEY
    );


if (
    !content ||
    content.trim() === ""
) {

    $done({

        response: {

            status: 404,

            headers: {

                "Content-Type":
                    "text/plain; charset=utf-8",

                "Cache-Control":
                    "no-cache, no-store"

            },

            body:
                "MrAcT Anyun Subscription Empty"

        }

    });

} else {

    $done({

        response: {

            status: 200,

            headers: {

                "Content-Type":
                    "text/plain; charset=utf-8",

                "Cache-Control":
                    "no-cache, no-store, must-revalidate",

                "Pragma":
                    "no-cache",

                "Expires":
                    "0",

                "X-MrAcT-Update":
                    updateTime ||
                    "unknown"

            },

            body:
                content

        }

    });

}