// components/dashboard/BarChart.jsx
import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { porSectorEconomico } from '../../services/dashboardBaseService';
import '../../css/dashboardBase.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ title = "Distribución por Rubro Económico", xAxisLabel = "Rubros", yAxisLabel = "Cantidad de Empresas" }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await porSectorEconomico();
        
        // Procesar la respuesta del backend
        if (response && response.rubros && Array.isArray(response.rubros)) {
          const processedData = response.rubros.map(rubro => ({
            label: rubro.nombreRubro,
            value: rubro.totalEmpresas,
            porcentaje: rubro.porcentaje
          }));
          setData(processedData);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error('Error al obtener datos de sectores:', error);
        setError('Error al cargar datos del gráfico');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (chartRef.current && data.length > 0 && !loading) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Colores para las barras
      const backgroundColors = [
        '#F29E38', '#072D42', '#BFAEA4', '#464E59', 
        '#9298A6', '#D9CBBF', '#8B4513', '#2F4F4F',
        '#556B2F', '#6B8E23'
      ];

      chartInstance.current = new ChartJS(ctx, {
        type: 'bar',
        data: {
          labels: data.map(item => item.label),
          datasets: [
            {
              label: 'Empresas',
              data: data.map(item => item.value),
              backgroundColor: backgroundColors.slice(0, data.length),
              borderColor: '#FFFFFF',
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
              // Hacer las barras más gruesas
              barPercentage: 0.7, // Controla el ancho de las barras (70% del espacio disponible)
              categoryPercentage: 0.8, // Controla el espacio entre categorías
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          // Cambiar la relación de aspecto para hacer el gráfico más alto
          aspectRatio: 1.5, // Más alto que ancho
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: title,
              color: '#072D42',
              font: {
                family: 'Plus Jakarta Sans',
                size: 16,
                weight: '600',
              },
            },
            tooltip: {
              backgroundColor: 'rgba(7, 45, 66, 0.95)',
              titleColor: '#F4E9D7',
              bodyColor: '#F4E9D7',
              callbacks: {
                label: (context) => {
                  const item = data[context.dataIndex];
                  return [
                    `Empresas: ${item.value}`,
                    `Porcentaje: ${item.porcentaje.toFixed(1)}%`
                  ];
                }
              }
            },
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(70, 78, 89, 0.1)',
                display: false, // Quitar grid vertical para más limpieza
              },
              ticks: {
                color: '#464E59',
                font: {
                  family: 'Inter',
                  size: 11,
                  weight: '500'
                },
                maxRotation: 45,
                minRotation: 45
              },
              title: {
                display: true,
                text: xAxisLabel,
                color: '#072D42',
                font: {
                  family: 'Plus Jakarta Sans',
                  size: 12,
                  weight: '600'
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(70, 78, 89, 0.15)',
              },
              ticks: {
                color: '#464E59',
                font: {
                  family: 'Inter',
                  size: 11,
                },
                precision: 0,
                // Asegurar que muestre todos los ticks posibles
                stepSize: 1
              },
              title: {
                display: true,
                text: yAxisLabel,
                color: '#072D42',
                font: {
                  family: 'Plus Jakarta Sans',
                  size: 12,
                  weight: '600'
                }
              },
              // Extender el eje Y para que las barras sean más altas
              suggestedMax: Math.max(...data.map(item => item.value)) * 1.2 // 20% más alto que el valor máximo
            },
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          // Ajustes de layout para más altura
          layout: {
            padding: {
              top: 20,
              bottom: 20
            }
          }
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, loading, title, xAxisLabel, yAxisLabel]);

  if (loading) {
    return (
      <div className="chart-container">
        <div className="loading-placeholder">
          <p>Cargando gráfico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
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
    <div className="chart-container" style={{ height: '500px' }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default BarChart;