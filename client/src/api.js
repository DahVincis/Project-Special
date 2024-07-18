import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const fetchAboutCompany = async () => {
    const response = await axios.get(`${API_URL}/about/`);
    return response.data;
};

export const fetchOurWork = async () => {
    const response = await axios.get(`${API_URL}/work/`);
    return response.data;
};

export const fetchTestimonials = async () => {
    const response = await axios.get(`${API_URL}/testimonials/`);
    return response.data;
};

export const fetchMeetOwner = async () => {
    const response = await axios.get(`${API_URL}/meet_owner/`);
    return response.data;
};

export const fetchInteriorExterior = async () => {
    const response = await axios.get(`${API_URL}/interior_exterior/`);
    return response.data;
};
