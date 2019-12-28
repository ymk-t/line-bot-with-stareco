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
server.post('/bot/webhook', line.middleware(line_config), (req, res) => {

    // 先行してLINE側にステータスコード200でレスポンスする。
    res.sendStatus(200);

    let events_processed = [];
    const placeInfo = {};
    const photoUrl = "";

    // イベントオブジェクトを順次処理。
    req.body.events.forEach((event) => {
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text") {

            //  場所情報を取得する
            placeInfo = place.callPlace(event.message.text);                
            
            // プレビュー用の画像を取得する
            photoUrl = photo.callPhoto(placeInfo.photo_reference)
        }
    })
            
    // replyMessage()で返信する
    Promise.all(placeInfo, photoUrl).then((response) => {
        console.log(response)
        return bot.replyMessage(event.replyToken, {
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
        })
    })
    .catch((errorMessage) => {
        console.log("エラー:" + errorMessage);
    })
})