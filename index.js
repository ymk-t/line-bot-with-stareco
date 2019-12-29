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
            console(`${result.length} event(s) processed.`)
            res.json(result)
        })
        .catch((errorMessage) => {
            console.log("【index.js】" + errorMessage);
    })
})
// イベントオブジェクトを順次処理。
function handleEvent(request) {
    let placeInfo = {};
    let photoUrl = "";

    request.body.events.forEach((event) => {

        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text") {

            //  場所情報を取得する
            console.log("placeInfo");
            placeInfo = place.callPlace(event.message.text);                
            console.log(placeInfo);

            // プレビュー用の画像を取得する
            console.log("photoInfo");
            photoUrl = photo.callPhoto(placeInfo.photo_reference)
            console.log(photoUrl);
        }          
        console.log("events_push");

        Promise.all(placeInfo,photoUrl).then((response) => {
            events_processed.push(bot.replyMessage(event.replyToken, {
                "type": "template",
                "altText": "This is a carousel template",
                "template": {
                    "type": "carousel",
                    "columns": [
                        {
                            "thumbnailImageUrl": photoUrl,
                            "text": placeInfo.name,
                            "actions": {
                                "type": "message",
                                "label": "photoReference",
                                "text": "photoReference"
                            }
                        }
                    ]
                }
            }))
        })
    })
}
