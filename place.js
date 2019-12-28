const axios = require('axios')

exports.callPlace = function (text) {
  try {
    const result = searchStarbucks(text)
    return result
  } catch (errorMessage) {
    console.log("【place.js】" + errorMessage);
  }
};

async function searchStarbucks (text) {
  const res = {};

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
  res.name = response.data.candidates[0].name;
  res.photo_reference = response.data.candidates[0].photos[0].photo_reference;
  
  return res
}  