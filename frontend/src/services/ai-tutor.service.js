import axios from "axios";

const API_URL = "http://localhost:8086/api/ai/";

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
