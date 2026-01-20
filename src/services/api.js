import axios from "axios";

const API_URL = "https://script.google.com/macros/s/AKfycbyvt34FFUZpadBqLVvoXOjLFuA1GeY1kGFknfh5by0Bd6Eu68wnvLOL3zOUvmKaRNdR/exec";

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
