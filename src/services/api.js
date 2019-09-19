import axios from 'axios';

const api = axios.create({
    baseURL: "https://omnistack-v6.herokuapp.com"
})

export default api;