const axios = require('axios')

exports.callMap = function (text) {
  const response = axios.get(
    'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
    {
      method: 'get',
      params: {
        language: 'ja',
        fields: 'formatted_address,name,place_id,photos',
        input: text,
        inputtype: 'textquery',
        key: process.env.GOOGLE_MAP_API
      }
    }
  )
  return {
    statusCode: 200,
    body: JSON.stringify(response.data)
  }
}