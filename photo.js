const axios = require('axios')

exports.callPhoto = function (photoId) {
  try {
    const result = searchPhoto(photoId)
    return result
  } catch (errorMessage) {
    console.log("【photo.js】" + errorMessage);
  }
};

async function searchPhoto (photoId) {
  let res = ""
  const response = await axios.get('https://maps.googleapis.com/maps/api/place/photo', {
    method: 'get',
    params: {
      photoreference: photoId,
      maxwidth: '250',
      key: process.env.GOOGLE_MAP_API
    }
  });
  res = response.request.res.responseUrl
  return res
}
