import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const fetchAboutCompany = async () => {
    const response = await axios.get(`${API_URL}/about/`);
    return response.data;
};

export const fetchOurWork = async () => {
    const response = await axios.get(`${API_URL}/work/`);
    return response.data;
};
