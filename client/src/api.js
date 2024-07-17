import axios from 'axios';

const API_URL = 'http://ec2-3-82-102-221.compute-1.amazonaws.com/api';

export const fetchAboutCompany = async () => {
    const response = await axios.get(`${API_URL}/about/`);
    return response.data;
};

export const fetchOurWork = async () => {
    const response = await axios.get(`${API_URL}/work/`);
    return response.data;
};
