// views/dashboardForUsers.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  DoughnutController,
  RadialLinearScale,
  RadarController
} from 'chart.js';
import '../css/dashboardForUsers.css';

// nuevo: servicio de carga/caché con reintentos
import { loadDataFromAPI, clearDatamartCache } from '../services/damartService';

// (opcional) mantenemos el JSON como fallback en desarrollo, pero no se usa por defecto
import datosFallback from '../assets/empresas_50_estructura.json';

// Registrar todos los elementos necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  RadarController,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
  DoughnutController
);

// Componente de Filtros
const FilterPanel = ({ filters, onFilterChange, data, isVisible, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const uniqueValues = useMemo(() => {
    return {
      rubros: [...new Set(data.empresas.map(e => e.rubro))],
      tamanos: [...new Set(data.empresas.map(e => e.tamanoEmpresa))],
      tiposSocietarios: [...new Set(data.empresas.map(e => e.tipoSocietaria))],
      departamentos: [...new Set(data.empresas.flatMap(e => e.sedes.map(s => s.nombre)))],
      tieneODS: ['Con ODS', 'Sin ODS'],
      esFamiliar: ['Familiar', 'No Familiar'],
      operaInternacional: ['Internacional', 'Nacional']
    };
  }, [data]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...localFilters,
      [filterType]: localFilters[filterType].includes(value) 
        ? localFilters[filterType].filter(item => item !== value)
        : [...localFilters[filterType], value]
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      rubros: [],
      tamanos: [],
      tiposSocietarios: [],
      departamentos: [],
      tieneODS: [],
      esFamiliar: [],
      operaInternacional: []
    };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFiltersCount = Object.values(localFilters).reduce((count, filterArray) => 
    count + filterArray.length, 0
  );

  if (!isVisible) return null;

  return (
    <div className="filter-panel-overlay" onClick={onClose}>
        <div className="filter-panel" onClick={(e) => e.stopPropagation()}>
        <div className="filter-header">
            <div className="filter-title">
            <h3>🎛️ Filtros Avanzados</h3>
            <p>Selecciona los criterios para filtrar los datos</p>
            </div>
            <div className="filter-controls">
            <div className="filter-stats">
                <span className="active-filters">{activeFiltersCount} filtros activos</span>
                <button onClick={clearFilters} className="clear-filters-btn">
                🗑️ Limpiar Todo
                </button>
            </div>
            <button onClick={onClose} className="close-filters-btn">
                ✕ Cerrar
            </button>
            </div>
        </div>

        <div className="filter-content">
            {Object.entries(uniqueValues).map(([key, values]) => (
            <div key={key} className="filter-group">
                <h4>{getFilterTitle(key)}</h4>
                <div className="filter-options">
                {values.map(value => (
                    <label key={value} className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={localFilters[key].includes(value)}
                        onChange={() => handleFilterChange(key, value)}
                    />
                    <span className="checkmark"></span>
                    {value}
                    </label>
                ))}
                </div>
            </div>
            ))}
        </div>
        </div>
    </div>
    );
};

const getFilterTitle = (filterKey) => {
  const titles = {
    rubros: '📊 Rubro Económico',
    tamanos: '🏢 Tamaño Empresa',
    tiposSocietarios: '🏛️ Tipo Societario',
    departamentos: '📍 Departamento',
    tieneODS: '🌱 Compromiso ODS',
    esFamiliar: '👨‍👩‍👧‍👦 Empresa Familiar',
    operaInternacional: '🌎 Operaciones'
  };
  return titles[filterKey] || filterKey;
};

// Componente de KPI Cards
const KPICards = ({ filteredData }) => {
  const kpis = useMemo(() => {
    const empresas = filteredData.empresas;
    const totalEmpresas = empresas.length;
    if (totalEmpresas === 0) return {};
    
    const empresasConODS = empresas.filter(e => e.ods.length > 0).length;
    const empresasInternacionales = empresas.filter(e => e.operacionesInternacionales).length;
    const empresasFamiliares = empresas.filter(e => e.empresaFamiliar).length;
    const empresasSostenibles = empresas.filter(e => e.sostenibilidad).length;
    const empresasConImpacto = empresas.filter(e => e.impactoSocial).length;
    
    const añoActual = new Date().getFullYear();
    const antiguedadPromedio = añoActual - (
      empresas.reduce((sum, e) => sum + new Date(e.fechaFundacion).getFullYear(), 0) / totalEmpresas
    );

    // KPIs adicionales
    const totalODS = empresas.reduce((sum, e) => sum + e.ods.length, 0);
    const promedioODSPorEmpresa = (totalODS / empresasConODS).toFixed(1);
    const empresasConCambios = empresas.filter(e => e.cambioRubro || e.cambioTipoSocietario).length;

    return {
      totalEmpresas,
      empresasConODS,
      empresasInternacionales,
      empresasFamiliares,
      empresasSostenibles,
      empresasConImpacto,
      promedioSedes: (empresas.reduce((sum, e) => sum + e.sedes.length, 0) / totalEmpresas).toFixed(1),
      antiguedadPromedio: antiguedadPromedio.toFixed(1),
      tasaODS: ((empresasConODS / totalEmpresas) * 100).toFixed(1),
      tasaInternacional: ((empresasInternacionales / totalEmpresas) * 100).toFixed(1),
      promedioODSPorEmpresa,
      empresasConCambios,
      tasaImpacto: ((empresasConImpacto / totalEmpresas) * 100).toFixed(1)
    };
  }, [filteredData]);

  if (Object.keys(kpis).length === 0) {
    return (
      <div className="kpi-grid">
        <div className="kpi-card no-data">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <h3>Sin Datos</h3>
            <div className="kpi-value">0</div>
            <div className="kpi-subtext">No hay empresas que coincidan con los filtros</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kpi-grid">
      <div className="kpi-card highlight">
        <div className="kpi-icon">🏢</div>
        <div className="kpi-content">
          <h3>Total Empresas</h3>
          <div className="kpi-value">{kpis.totalEmpresas}</div>
          <div className="kpi-subtext">Ecosistema analizado</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon">🌱</div>
        <div className="kpi-content">
          <h3>Compromiso ODS</h3>
          <div className="kpi-value">{kpis.empresasConODS}</div>
          <div className="kpi-subtext">{kpis.tasaODS}% del total</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon">🌎</div>
        <div className="kpi-content">
          <h3>Internacionales</h3>
          <div className="kpi-value">{kpis.empresasInternacionales}</div>
          <div className="kpi-subtext">{kpis.tasaInternacional}% exportan</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon">👨‍👩‍👧‍👦</div>
        <div className="kpi-content">
          <h3>Empresas Familiares</h3>
          <div className="kpi-value">{kpis.empresasFamiliares}</div>
          <div className="kpi-subtext">Tradición empresarial</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon">🏛️</div>
        <div className="kpi-content">
          <h3>Promedio Sedes</h3>
          <div className="kpi-value">{kpis.promedioSedes}</div>
          <div className="kpi-subtext">Presencia nacional</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon">♻️</div>
        <div className="kpi-content">
          <h3>Sostenibles</h3>
          <div className="kpi-value">{kpis.empresasSostenibles}</div>
          <div className="kpi-subtext">Prácticas ecológicas</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon">📅</div>
        <div className="kpi-content">
          <h3>Antigüedad Promedio</h3>
          <div className="kpi-value">{kpis.antiguedadPromedio} años</div>
          <div className="kpi-subtext">Experiencia acumulada</div>
        </div>
      </div>

      {/* Nuevos KPIs */}
      <div className="kpi-card">
        <div className="kpi-icon">🎯</div>
        <div className="kpi-content">
          <h3>Impacto Social</h3>
          <div className="kpi-value">{kpis.empresasConImpacto}</div>
          <div className="kpi-subtext">{kpis.tasaImpacto}% del total</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon">🔄</div>
        <div className="kpi-content">
          <h3>Empresas Flexibles</h3>
          <div className="kpi-value">{kpis.empresasConCambios}</div>
          <div className="kpi-subtext">Adaptación estratégica</div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-icon">📈</div>
        <div className="kpi-content">
          <h3>ODS/Empresa</h3>
          <div className="kpi-value">{kpis.promedioODSPorEmpresa}</div>
          <div className="kpi-subtext">Compromiso promedio</div>
        </div>
      </div>
    </div>
  );
};

// Gráfico de Distribución por Rubro
const RubroChart = ({ filteredData }) => {
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);

  const data = useMemo(() => {
    const rubrosCount = filteredData.empresas.reduce((acc, empresa) => {
      acc[empresa.rubro] = (acc[empresa.rubro] || 0) + 1;
      return acc;
    }, {});

    const backgroundColors = [
      '#F29E38', '#072D42', '#BFAEA4', '#464E59', 
      '#9298A6', '#D9CBBF', '#8B4513', '#2F4F4F'
    ];

    return {
      labels: Object.keys(rubrosCount),
      datasets: [
        {
          label: 'Empresas por Rubro',
          data: Object.values(rubrosCount),
          backgroundColor: backgroundColors.slice(0, Object.keys(rubrosCount).length),
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }
      ]
    };
  }, [filteredData]);

  useEffect(() => {
    if (chartRef.current && data.labels.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new ChartJS(ctx, {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: 'Distribución por Rubro Económico',
              color: '#072D42',
              font: {
                family: 'Plus Jakarta Sans',
                size: 18,
                weight: '600'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(7, 45, 66, 0.95)',
              titleColor: '#F4E9D7',
              bodyColor: '#F4E9D7',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                font: {
                  size: 12
                }
              },
              grid: {
                color: 'rgba(70, 78, 89, 0.1)'
              }
            },
            x: {
              ticks: {
                font: {
                  size: 11
                }
              },
              grid: {
                color: 'rgba(70, 78, 89, 0.1)'
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (data.labels.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data-chart">
          <div className="no-data-icon">📊</div>
          <p>No hay datos para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container large-chart">
      <canvas ref={chartRef} />
    </div>
  );
};

// Gráfico de ODS por Tamaño
const ODSBySizeChart = ({ filteredData }) => {
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);

  const data = useMemo(() => {
    // Obtener todos los tamaños únicos del JSON
    const uniqueTamanos = [...new Set(filteredData.empresas.map(e => e.tamanioEmpresa))];
    
    // Crear objeto con los resultados
    const result = {};
    
    uniqueTamanos.forEach(tamano => {
      // Filtrar empresas por tamaño
      const empresasTamano = filteredData.empresas.filter(e => e.tamanioEmpresa === tamano);
      
      result[tamano] = {
        total: empresasTamano.length,
        conODS: empresasTamano.filter(e => e.ods && e.ods.length > 0).length
      };
    });

    // Ordenar tamaños por total de empresas (opcional)
    const sortedTamanos = uniqueTamanos.sort((a, b) => result[b].total - result[a].total);

    return {
      labels: sortedTamanos,
      datasets: [
        {
          label: 'Con ODS',
          data: sortedTamanos.map(t => result[t].conODS),
          backgroundColor: '#F29E38'
        },
        {
          label: 'Sin ODS',
          data: sortedTamanos.map(t => result[t].total - result[t].conODS),
          backgroundColor: '#464E59'
        }
      ]
    };
  }, [filteredData]);

  useEffect(() => {
    if (chartRef.current && data.labels.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new ChartJS(ctx, {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Compromiso ODS por Tamaño de Empresa',
              color: '#072D42',
              font: {
                family: 'Plus Jakarta Sans',
                size: 18,
                weight: '600'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(7, 45, 66, 0.95)',
              titleColor: '#F4E9D7',
              bodyColor: '#F4E9D7',
              callbacks: {
                label: (context) => {
                  const datasetLabel = context.dataset.label;
                  const value = context.parsed.y;
                  const total = data.datasets[0].data[context.dataIndex] + 
                              data.datasets[1].data[context.dataIndex];
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${datasetLabel}: ${value} (${percentage}%)`;
                }
              }
            },
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            x: {
              stacked: true,
              ticks: {
                font: {
                  size: 12
                }
              },
              grid: {
                color: 'rgba(70, 78, 89, 0.1)'
              }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: {
                precision: 0,
                font: {
                  size: 12
                }
              },
              grid: {
                color: 'rgba(70, 78, 89, 0.1)'
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  // Validación de datos
  if (!filteredData.empresas || filteredData.empresas.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data-chart">
          <div className="no-data-icon">📊</div>
          <p>No hay datos para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container large-chart">
      <canvas ref={chartRef} />
    </div>
  );
};

// Gráfico de Evolución Temporal
const TimelineChart = ({ filteredData }) => {
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);

  const data = useMemo(() => {
    // Contar empresas por año específico
    const empresasPorAño = filteredData.empresas.reduce((acc, empresa) => {
      // Verificar que la fecha de fundación sea válida
      if (empresa.fechaFundacion) {
        const fecha = new Date(empresa.fechaFundacion);
        if (!isNaN(fecha.getTime())) {
          const año = fecha.getFullYear();
          acc[año] = (acc[año] || 0) + 1;
        }
      }
      return acc;
    }, {});

    console.log('Empresas por año:', empresasPorAño); // Para debug

    // Ordenar por año (de más antiguo a más reciente)
    const sortedEntries = Object.entries(empresasPorAño)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

    return {
      labels: sortedEntries.map(([año]) => año),
      datasets: [
        {
          label: 'Empresas Fundadas',
          data: sortedEntries.map(([, count]) => count),
          borderColor: '#F29E38',
          backgroundColor: 'rgba(242, 158, 56, 0.1)',
          borderWidth: 3,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#072D42',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }, [filteredData]);

  useEffect(() => {
    if (chartRef.current && data.labels.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new ChartJS(ctx, {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Evolución de Creación de Empresas por Año',
              color: '#072D42',
              font: {
                family: 'Plus Jakarta Sans',
                size: 18,
                weight: '600'
              }
            },
            tooltip: {
              backgroundColor: 'rgba(7, 45, 66, 0.95)',
              titleColor: '#F4E9D7',
              bodyColor: '#F4E9D7',
              callbacks: {
                title: (context) => {
                  return `Año ${context[0].label}`;
                },
                label: (context) => {
                  return `${context.dataset.label}: ${context.parsed.y}`;
                }
              }
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#072D42',
                font: {
                  size: 12,
                  weight: '600'
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cantidad de Empresas',
                color: '#072D42',
                font: {
                  size: 12,
                  weight: '600'
                }
              },
              ticks: {
                precision: 0,
                font: {
                  size: 11
                }
              },
              grid: {
                color: 'rgba(70, 78, 89, 0.1)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Año de Fundación',
                color: '#072D42',
                font: {
                  size: 12,
                  weight: '600'
                }
              },
              ticks: {
                font: {
                  size: 10, // Tamaño más pequeño para muchos años
                },
                maxRotation: 90, // Rotación vertical si hay muchos años
                minRotation: 90,
                callback: function(value, index, values) {
                  // Mostrar solo algunos años si hay muchos para evitar saturación
                  if (values.length > 20) {
                    return index % Math.ceil(values.length / 15) === 0 ? this.getLabelForValue(value) : '';
                  }
                  return this.getLabelForValue(value);
                }
              },
              grid: {
                color: 'rgba(70, 78, 89, 0.1)'
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          elements: {
            line: {
              tension: 0.3
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (data.labels.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data-chart">
          <div className="no-data-icon">📊</div>
          <p>No hay datos para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container extra-large-chart">
      <canvas ref={chartRef} />
    </div>
  );
};

// Gráfico de Radar - Perfil Empresarial Promedio
const RadarChart = ({ filteredData }) => {
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);

  const data = useMemo(() => {
    const empresas = filteredData.empresas;
    const total = empresas.length;
    
    if (total === 0) return { labels: [], datasets: [] };

    const metrics = {
      'Internacionalización': (empresas.filter(e => e.operacionesInternacionales).length / total) * 100,
      'Sostenibilidad': (empresas.filter(e => e.sostenibilidad).length / total) * 100,
      'Impacto Social': (empresas.filter(e => e.impactoSocial).length / total) * 100,
      'Compromiso ODS': (empresas.filter(e => e.ods.length > 0).length / total) * 100,
      'Presencia Nacional': (empresas.reduce((sum, e) => sum + e.sedes.length, 0) / total) * 20,
      'Antigüedad': (empresas.reduce((sum, e) => {
        const años = new Date().getFullYear() - new Date(e.fechaFundacion).getFullYear();
        return sum + Math.min(años, 50);
      }, 0) / total) * 2
    };

    return {
      labels: Object.keys(metrics),
      datasets: [
        {
          label: 'Perfil Empresarial Promedio',
          data: Object.values(metrics),
          backgroundColor: 'rgba(242, 158, 56, 0.2)',
          borderColor: '#F29E38',
          pointBackgroundColor: '#072D42',
          pointBorderColor: '#FFFFFF',
          pointHoverBackgroundColor: '#F29E38',
          pointHoverBorderColor: '#072D42',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }, [filteredData]);

  useEffect(() => {
    if (chartRef.current && data.labels.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new ChartJS(ctx, {
        type: 'radar',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Perfil Empresarial Promedio',
              color: '#072D42',
              font: {
                family: 'Plus Jakarta Sans',
                size: 18,
                weight: '600'
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                }
              }
            }
          },
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: {
                backdropColor: 'transparent',
                color: '#464E59',
                font: {
                  size: 11
                }
              },
              grid: {
                color: 'rgba(70, 78, 89, 0.1)'
              },
              angleLines: {
                color: 'rgba(70, 78, 89, 0.1)'
              },
              pointLabels: {
                color: '#072D42',
                font: {
                  family: 'Inter',
                  size: 12,
                  weight: '500'
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (data.labels.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data-chart">
          <div className="no-data-icon">📡</div>
          <p>No hay datos para el gráfico de radar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container large-chart">
      <canvas ref={chartRef} />
    </div>
  );
};

// Gráfico de Dona - Distribución ODS
const ODSDistributionChart = ({ filteredData }) => {
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);

  const data = useMemo(() => {
    const odsCount = filteredData.empresas.reduce((acc, empresa) => {
      empresa.ods.forEach(ods => {
        acc[ods.nombre] = (acc[ods.nombre] || 0) + 1;
      });
      return acc;
    }, {});

    const sortedODS = Object.entries(odsCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);

    const backgroundColors = [
      '#F29E38', '#072D42', '#BFAEA4', '#464E59',
      '#9298A6', '#D9CBBF', '#8B4513', '#2F4F4F'
    ];

    return {
      labels: sortedODS.map(([ods]) => ods),
      datasets: [
        {
          data: sortedODS.map(([, count]) => count),
          backgroundColor: backgroundColors.slice(0, sortedODS.length),
          borderWidth: 2,
          borderColor: '#FFFFFF',
          hoverOffset: 15
        }
      ]
    };
  }, [filteredData]);

  useEffect(() => {
    if (chartRef.current && data.labels.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new ChartJS(ctx, {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            title: {
              display: true,
              text: 'Distribución de Objetivos ODS',
              color: '#072D42',
              font: {
                family: 'Plus Jakarta Sans',
                size: 18,
                weight: '600'
              }
            },
            legend: {
              position: 'bottom',
              labels: {
                color: '#072D42',
                font: {
                  family: 'Inter',
                  size: 11
                },
                padding: 15,
                usePointStyle: true
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                  return `${context.label}: ${context.parsed} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (data.labels.length === 0) {
    return (
      <div className="chart-container">
        <div className="no-data-chart">
          <div className="no-data-icon">🎯</div>
          <p>No hay datos de ODS para mostrar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container large-chart">
      <canvas ref={chartRef} />
    </div>
  );
};

const SmallLoading = () => (
  <div className="loading-screen">
    <div className="loading-content">
      <div className="loading-animation">
        <div className="loading-spinner-large"></div>
        <div className="loading-pulse"></div>
      </div>

      <div className="loading-text">
        <h2>🔄 Cargando Dashboard Empresarial</h2>
        <p>Estamos preparando todos los datos y gráficos...</p>

        <div className="loading-steps">
          <div className="loading-step active">📊 Conectando con la base de datos</div>
          <div className="loading-step">📈 Procesando información empresarial</div>
          <div className="loading-step">🎯 Configurando análisis ODS</div>
          <div className="loading-step">🌎 Cargando datos internacionales</div>
        </div>
      </div>
    </div>
  </div>
);

// Mensaje de error simple con opción de reintento / redirección
const LoadError = ({ error, onRetry }) => {
  const redirectPath = (error && error.redirectPath) || '/Dashboard-bicentenario/';
  const userMessage = (error && error.userMessage) || 'Ups, algo pasó. Intente más tarde.';

  return (
    <div className="error-state">
      <div className="error-icon">⚠️</div>
      <h3>Error al cargar los datos</h3>
      <p>{userMessage}</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button onClick={onRetry} className="retry-button">Reintentar</button>
        <button onClick={() => (window.location.href = '/Dashboard-bicentenario/')} className="redirect-button">
          Ir a Inicio
        </button>
      </div>
    </div>
  );
};

// Reemplazar uso directo de datos por carga desde service
const DashboardForUsers = () => {
  // 1. Primero todos los useState
  const [filters, setFilters] = useState({
    rubros: [],
    tamanos: [],
    tiposSocietarios: [],
    departamentos: [],
    tieneODS: [],
    esFamiliar: [],
    operaInternacional: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [data, setData] = useState({ empresas: [] });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // 2. Luego los useMemo
  const filteredData = useMemo(() => {
    let filtered = [...(data && Array.isArray(data.empresas) ? data.empresas : [])];

    // Aplicar filtros
    if (filters.rubros.length > 0) {
      filtered = filtered.filter(empresa => filters.rubros.includes(empresa.rubro));
    }

    if (filters.tamanos.length > 0) {
      filtered = filtered.filter(empresa => filters.tamanos.includes(empresa.tamanoEmpresa));
    }

    if (filters.tiposSocietarios.length > 0) {
      filtered = filtered.filter(empresa => filters.tiposSocietarios.includes(empresa.tipoSocietaria));
    }

    if (filters.departamentos.length > 0) {
      filtered = filtered.filter(empresa => 
        empresa.sedes.some(sede => filters.departamentos.includes(sede.nombre))
      );
    }

    if (filters.tieneODS.length > 0) {
      if (filters.tieneODS.includes('Con ODS')) {
        filtered = filtered.filter(empresa => empresa.ods.length > 0);
      }
      if (filters.tieneODS.includes('Sin ODS')) {
        filtered = filtered.filter(empresa => empresa.ods.length === 0);
      }
    }

    if (filters.esFamiliar.length > 0) {
      if (filters.esFamiliar.includes('Familiar')) {
        filtered = filtered.filter(empresa => empresa.empresaFamiliar);
      }
      if (filters.esFamiliar.includes('No Familiar')) {
        filtered = filtered.filter(empresa => !empresa.empresaFamiliar);
      }
    }

    if (filters.operaInternacional.length > 0) {
      if (filters.operaInternacional.includes('Internacional')) {
        filtered = filtered.filter(empresa => empresa.operacionesInternacionales);
      }
      if (filters.operaInternacional.includes('Nacional')) {
        filtered = filtered.filter(empresa => !empresa.operacionesInternacionales);
      }
    }

    return { empresas: filtered };
  }, [filters, data]);

  const activeFiltersCount = useMemo(() => 
    Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0),
    [filters]
  );

  // 3. Funciones auxiliares
  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const apiData = await loadDataFromAPI();
      setData(apiData);
    } catch (err) {
      console.error('loadDataFromAPI error:', err);
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Por último los useEffect
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Renderizado condicional
  if (loading) return <SmallLoading />;

  if (loadError) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-container">
          <LoadError 
            error={loadError} 
            onRetry={() => { 
              clearDatamartCache(); 
              load(); 
            }} 
          />
        </div>
      </div>
    );
  }

  // Render principal
  return (
    <div className="analytics-dashboard">
      <div className="analytics-container">
        <header className="analytics-header">
          <div className="header-top">
            {/* Nuevo botón de retorno */}
            <button 
              onClick={() => window.location.href = '/Dashboard-bicentenario/'}
              className="back-home-button"
            >
              <span>Volver al Dashboard base</span>
            </button>
            
            <div className="header-title">
              <h1 className="analytics-title">Bicentenario Analytics Dashboard </h1>
              <p className="analytics-subtitle">
                Análisis cruzado en tiempo real del ecosistema empresarial boliviano
              </p>
            </div>
            <button 
              className={`filter-toggle-btn ${activeFiltersCount > 0 ? 'has-filters' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <span className="filter-icon">🎛️</span>
              <span className="filter-text">Filtros Avanzados</span>
              {activeFiltersCount > 0 && (
                  <span className="filter-count-badge">{activeFiltersCount}</span>
              )}
            </button>
          </div>
        </header>

        <div className="analytics-layout">
          {/* Panel de Filtros (ahora overlay) */}
          <FilterPanel 
            filters={filters} 
            onFilterChange={setFilters}
            data={data}
            isVisible={showFilters}
            onClose={() => setShowFilters(false)}
          />

          {/* Contenido Principal - Ahora ocupa todo el ancho */}
          <div className="analytics-content full-width">
            {/* KPIs */}
            <div className="analytics-section">
              <KPICards filteredData={filteredData} />
            </div>

            {/* Primera fila de gráficos - 2 columnas */}
            <div className="analytics-section">
              <div className="charts-grid large-grid">
                <div className="chart-block large">
                  <RubroChart filteredData={filteredData} />
                </div>
                <div className="chart-block large">
                  <ODSBySizeChart filteredData={filteredData} />
                </div>
              </div>
            </div>

            {/* Segunda fila de gráficos - 2 columnas */}
            <div className="analytics-section">
              <div className="charts-grid large-grid">
                <div className="chart-block large">
                  <ODSDistributionChart filteredData={filteredData} />
                </div>
                <div className="chart-block large">
                  <RadarChart filteredData={filteredData} />
                </div>
              </div>
            </div>

            {/* Tercera fila - gráfico completo */}
            <div className="analytics-section">
              <div className="charts-grid">
                <div className="chart-block full-width">
                  <TimelineChart filteredData={filteredData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardForUsers;