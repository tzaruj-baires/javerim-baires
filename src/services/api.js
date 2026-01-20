import axios from "axios";

const API_URL = import.meta.env.VITE_GOOGLE_API;

const params = (resource, action, data = {}) =>
  new URLSearchParams({ resource, action, ...data });

export const getAll = (resource) =>
  axios.get(API_URL, { params: { resource } });

export const create = (resource, data) =>
  axios.post(API_URL, params(resource, "create", data));

export const update = (resource, data) =>
  axios.post(API_URL, params(resource, "update", data));

export const remove = (resource, id) =>
  axios.post(API_URL, params(resource, "delete", { id }));
