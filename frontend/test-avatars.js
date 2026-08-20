const axios = require('axios');
axios.get('http://localhost:8080/api/v1/gallery/avatars') // Or whatever the backend URL is.
  .then(res => console.log(res.data))
  .catch(err => console.log("error fetching"))
