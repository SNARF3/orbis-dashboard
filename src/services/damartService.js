

const API_URL = import.meta.env.VITE_API_URL_DATAMART;
const FETCH_TIMEOUT = 30000; // 30 segundos máximo por request

let cachedData = null;
let loadingPromise = null;

/**
 * delay: espera asíncrona
 */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Validación mínima de la estructura esperada del datamart.
 * Retorna true si parece válido.
 */
const validateDatamart = (data) => {
  return data && typeof data === 'object' && Array.isArray(data.empresas);
};

/**
 * loadDataFromAPI
 * - retries: número de reintentos (por defecto 3 reintentos -> 4 intentos totales)
 * - timeoutMs: timeout de espera entre reintentos base (se aplica backoff exponencial)
 *
 * Devuelve datos (cached) o lanza error enriquecido si falla después de reintentos.
 */
export const loadDataFromAPI = async ({ retries = 3, timeoutMs = 700 } = {}) => {
  // Si ya hay cache, devolverla inmediatamente
  if (cachedData) return cachedData;

  // Si ya hay una promesa de carga en curso, reutilizarla
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      let timeoutId = null;
      let controller = null;

      try {
        // Log para debug
        console.debug(`[datamartService] intento ${attempt + 1} de ${retries + 1} -> ${API_URL}`);

        // Crear controller para poder abortar el fetch
        controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const signal = controller ? controller.signal : undefined;

        // Configurar timeout para abortar la petición si toma demasiado tiempo
        if (controller) {
          timeoutId = setTimeout(() => {
            controller.abort();
            console.warn(`[datamartService] timeout en intento ${attempt + 1} después de ${FETCH_TIMEOUT}ms`);
          }, FETCH_TIMEOUT);
        }

        const response = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          credentials: 'omit',
          signal
        });

        // Limpiar timeout ya que la respuesta llegó a tiempo
        if (timeoutId) clearTimeout(timeoutId);

        if (!response.ok) {
          // HTTP error -> lanzar para caer en el catch y reintentar
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Validación mínima del payload
        if (!validateDatamart(data)) {
          throw new Error('Respuesta del datamart no tiene la estructura esperada (campo "empresas" faltante o no es array).');
        }

        // Cachear y devolver
        cachedData = data;
        return data;
      } catch (err) {
        // Limpiar timeout en caso de error
        if (timeoutId) clearTimeout(timeoutId);

        console.warn(`[datamartService] error en intento ${attempt + 1}:`, err.message || err);

        // Si quedan reintentos, esperar con backoff exponencial antes de reintentar
        if (attempt < retries) {
          const backoff = timeoutMs * Math.pow(2, attempt); // 700, 1400, 2800 ...
          console.debug(`[datamartService] esperando ${backoff}ms antes del reintento...`);
          await delay(backoff);
          continue;
        }

        // Después del último intento fallido: preparar error enriquecido para el componente
        const finalError = new Error('No se pudo cargar el datamart tras varios intentos.');
        finalError.originalError = err;
        finalError.attempts = retries + 1;
        finalError.userMessage = 'Ups, algo pasó cargando los datos. Intente más tarde.';
        finalError.redirectPath = '/Dashboard-bicentenario';
        
        // Determinar si fue timeout para mensaje más específico
        if (err.name === 'AbortError') {
          finalError.userMessage = 'La consulta está tomando demasiado tiempo. Por favor, intente más tarde.';
        }
        
        // limpiar estado de loadingPromise para permitir nuevos intentos desde el componente si se desea
        loadingPromise = null;
        throw finalError;
      }
    }
  })();

  return loadingPromise;
};

/**
 * clearDatamartCache: limpia cache en memoria para forzar recarga
 */
export const clearDatamartCache = () => {
  cachedData = null;
  loadingPromise = null;
};