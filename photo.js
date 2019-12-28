const axios = require('axios')

exports.callPhoto = function (photoId) {
  const result = searchPhoto(photoId)
  return result
};

async function searchPhoto (photoId) {
  const response = await axios.get('https://maps.googleapis.com/maps/api/place/photo', {
    method: 'get',
    params: {
      photoreference: photoId,
      maxwidth: '250',
      key: process.env.GOOGLE_MAP_API
    }
  });
  const res = "";
  res = response.request.res.responseUrl
  return res
}