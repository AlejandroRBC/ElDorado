import axios from "axios";

export const buscarAfiliadoCI = (ci) =>
  axios.get(`/api/afiliados/ci/${ci}`);

export const asignarTenencia = (data) =>
  axios.post(`/api/tenencia/asignar`, data);
