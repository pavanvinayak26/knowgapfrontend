import axios from "axios";
import API_BASE_URL from "./api-base";

const API_URL = `${API_BASE_URL}/api/ai/`;

const buildPlan = (payload) => {
  return axios.post(API_URL + "plan", payload);
};

const chat = (payload) => {
  return axios.post(API_URL + "chat", payload);
};

const AiTutorService = {
  buildPlan,
  chat
};

export default AiTutorService;
