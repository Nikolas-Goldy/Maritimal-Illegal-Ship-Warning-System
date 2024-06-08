// src/api.js
import axios from 'axios';

const API_URL = 'https://gateway.api.globalfishingwatch.org/v2/datasets/public-eez-areas/user-context-layers';

export const login = (credentials) => {
  return axios.post(`${API_URL}/login`, credentials);
};


// https://gateway.api.globalfishingwatch.org/v2/datasets/public-eez-areas/user-context-layers