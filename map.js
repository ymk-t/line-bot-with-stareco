const axios = require('axios')

exports.callMap = function (text) {
  const result = searchStarbucks(text)
  return result
};

async function searchStarbucks (text) {
  const response = await axios.get(
    'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
    {
      method: 'get',
      params: {
        language: 'ja',
        fields: 'formatted_address,name,place_id,photos',
        input: text + ' スターバックス',
        inputtype: 'textquery',
        key: process.env.GOOGLE_MAP_API
      }
    }
  );
  console.log(response.data);
  console.log(JSON.parse(response));
}