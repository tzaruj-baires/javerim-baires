import axios from "axios";

const API_URL = "https://script.google.com/macros/s/AKfycbyvt34FFUZpadBqLVvoXOjLFuA1GeY1kGFknfh5by0Bd6Eu68wnvLOL3zOUvmKaRNdR/exec";

export const getUsers = () => axios.get(API_URL);

export const createUser = (user) => {
  const params = new URLSearchParams();
  params.append("action", "create");
  params.append("id", user.id);
  params.append("nombre", user.nombre);
  params.append("email", user.email);
  params.append("edad", user.edad);

  return axios.post(API_URL, params);
};

export const updateUser = (user) => {
  const params = new URLSearchParams();
  params.append("action", "update");
  params.append("id", user.id);
  params.append("nombre", user.nombre);
  params.append("email", user.email);
  params.append("edad", user.edad);

  return axios.post(API_URL, params);
};
