import axios from 'axios';

const API_URL = 'https://dsit36td3e5be.cloudfront.net/api';

export const fetchAboutCompany = async () => {
    const response = await axios.get(`${API_URL}/about/`);
    return response.data;
};

export const fetchOurWork = async () => {
    const response = await axios.get(`${API_URL}/work/`);
    return response.data;
};
