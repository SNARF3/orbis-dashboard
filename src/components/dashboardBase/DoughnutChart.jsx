// components/dashboardBase/DoughnutChart.jsx
import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  DoughnutController,
  Legend,
} from 'chart.js';
import { conCompromisoODS } from '../../services/dashboardBaseService';
import '../../css/dashboardBase.css';

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  DoughnutController,
  Legend
);

const DoughnutChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const odsData = await conCompromisoODS();
        
        const normalizedData = [
          { 
            label: 'Con Acciones ODS', 
            value: parseFloat((odsData.conAcciones || 0).toFixed(2)) 
          },
          { 
            label: 'Sin Acciones ODS', 
            value: parseFloat((odsData.sinAcciones || 0).toFixed(2)) 
          },
        ];
        
        setData(normalizedData);
      } catch (error) {
        console.error('Error al obtener datos de ODS:', error);
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

      const total = data.reduce((sum, item) => sum + item.value, 0);

      chartInstance.current = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map(item => item.label),
          datasets: [
            {
              data: data.map(item => item.value),
              backgroundColor: ['#F29E38', '#072D42'],
              borderColor: '#FFFFFF',
              borderWidth: 3,
              borderRadius: 8,
              spacing: 2,
              hoverOffset: 12,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(7, 45, 66, 0.95)',
              titleColor: '#F4E9D7',
              bodyColor: '#F4E9D7',
              borderColor: '#F29E38',
              borderWidth: 2,
              cornerRadius: 8,
              displayColors: true,
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return `${label}: ${value} (${percentage}%)`;
                }
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, loading]);

  const stats = React.useMemo(() => {
    if (data.length === 0) return null;
    
    const total = parseFloat(data.reduce((sum, item) => sum + item.value, 0).toFixed(2));
    const conODS = data[0];
    const sinODS = data[1];
    
    return {
      total,
      conODSValue: parseFloat((conODS?.value || 0).toFixed(2)),
      conODSPercentage: total > 0 ? parseFloat(((conODS?.value / total) * 100).toFixed(1)) : 0,
      sinODSValue: parseFloat((sinODS?.value || 0).toFixed(2)),
      sinODSPercentage: total > 0 ? parseFloat(((sinODS?.value / total) * 100).toFixed(1)) : 0,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="doughnut-chart-container">
        <div className="doughnut-loading">
          <div className="loading-spinner"></div>
          <p>Cargando datos de ODS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doughnut-chart-container">
        <div className="doughnut-error">
          <div className="error-icon">⚠️</div>
          <h3>Error al cargar el gráfico</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0 || data.every(item => item.value === 0)) {
    return (
      <div className="doughnut-chart-container">
        <div className="doughnut-empty">
          <div className="empty-icon">📊</div>
          <h3>No hay datos disponibles</h3>
          <p>No se encontraron datos para mostrar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doughnut-chart-container">
      <div className="doughnut-header">
        <h3>Compromiso ODS</h3>
      </div>
      
      {/* Contenedor principal igual que LineChart */}
      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">TOTAL EMPRESAS</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item highlight">
          <span className="stat-label">CON ACCIONES ODS</span>
          <span className="stat-value">
            {stats.conODSValue} ({stats.conODSPercentage}%)
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">SIN ACCIONES ODS</span>
          <span className="stat-value">
            {stats.sinODSValue} ({stats.sinODSPercentage}%)
          </span>
        </div>
      </div>
      
      {/* Gráfico con altura fija como LineChart */}
      <div className="doughnut-chart-wrapper">
        <canvas ref={chartRef} />
        {stats && (
          <div className="doughnut-center">
            <span className="center-value">{stats.conODSPercentage}%</span>
            <span className="center-label">Con ODS</span>
          </div>
        )}
      </div>

      <div className="doughnut-legend">
        <div className="legend-item">
          <div className="legend-color con"></div>
          <span>Con Acciones ODS</span>
        </div>
        <div className="legend-item">
          <div className="legend-color sin"></div>
          <span>Sin Acciones ODS</span>
        </div>
      </div>
    </div>
  );
};

export default DoughnutChart;