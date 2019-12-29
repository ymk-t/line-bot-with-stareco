// -----------------------------------------------------------------------------
// モジュールのインポート
const server = require("express")();
const line = require("@line/bot-sdk"); // Messaging APIのSDKをインポート
const place = require("./place");
const photo = require("./photo");

// -----------------------------------------------------------------------------
// パラメータ設定
const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN, // 環境変数からアクセストークンをセットしています
    channelSecret: process.env.LINE_CHANNEL_SECRET // 環境変数からChannel Secretをセットしています
};

// -----------------------------------------------------------------------------
// Webサーバー設定
server.listen(process.env.PORT || 3000);

// -----------------------------------------------------------------------------
// APIコールのためのクライアントインスタンスを作成
const bot = new line.Client(line_config);

// -----------------------------------------------------------------------------
// ルーター設定
let middle = line.middleware(line_config);

// すべてのイベント処理のプロミスを格納する配列。
let events_processed = [];

server.post('/bot/webhook', middle, (req, res) => {

    // 先行してLINE側にステータスコード200でレスポンスする。
    res.sendStatus(200);

    // イベント処理機能を実行
    handleEvent(req);

    // イベントが何件処理されたか確認する
    Promise
        .all(events_processed)
        .then((result) => {
            console.log(`${result.length} event(s) processed.`)
            console.log(events_processed)
        })
        .catch((errorMessage) => {
            console.log("【index.js】" + errorMessage);
    })
})
// イベントオブジェクトを順次処理。
function handleEvent(request) {

    request.body.events.forEach((event) => {

        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text") {

            //  場所情報を取得する
            place.callPlace(event.message.text).then((plaecResult) => {
                
                // プレビュー用の画像を取得する
                photo.callPhoto(plaecResult.photo_reference).then((photoResult) => {
                
                    // 返信メッセージをイベントオブジェクトに挿入する
                    events_processed.push(bot.replyMessage(event.replyToken, {
                        "type": "template",
                        "altText": "This is a carousel template",
                        "template": {
                            "type": "carousel",
                            "columns": [
                                {
                                    "thumbnailImageUrl": photoResult,
                                    "text": plaecResult.name,
                                    "actions": {
                                        "type": "message",
                                        "label": "photoReference",
                                        "text": "photoReference"
                                    }
                                }
                            ]
                        }
                    }));
                });
            });
        }          
    })
}
