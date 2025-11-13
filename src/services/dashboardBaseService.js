// services/dashboardBaseService.js
import api from "./api";

export const promedioAnios = async () => {
  const response = await api.get("/promedio-antiguedad");
  return response.data;
};

export const empresasPorAnio = async (anioInicio = 1825, anioFin = new Date().getFullYear()) => {
  const response = await api.get(`/empresas-anio?inicio=${anioInicio}&fin=${anioFin}`);
  return response.data;
};

export const promedioPorTamanio = async () => {
  const response = await api.get("/empresas-tamanios-porcentaje");
  return response.data;
};

export const porSectorEconomico = async () => {
  const response = await api.get("/porcentajes-rubros");
  return response.data;
};

export const promedioPorSedes = async () => {
  const response = await api.get("/promedio-sedes");
  return response.data;
};

export const conCompromisoODS = async () => {
  const response = await api.get("/porciones-accion");
  return response.data;
};

export const empresasPorDepartamento = async () => {
  const response = await api.get("/empresas-departamento");
  return response.data;
};

export const hitosPorAnio = async () => {
  const response = await api.get("/total-hitos-anio");
  return response.data;
};