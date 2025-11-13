// components/dashboard/KPICards.jsx
import React, { useEffect, useState } from 'react';
import { promedioAnios, promedioPorSedes } from '../../services/dashboardBaseService';
import StatCard from './StatCard';
import '../../css/dashboardBase.css';

const extractValue = (data) => {
  if (typeof data === 'number') return data;
  if (typeof data === 'string') return parseFloat(data) || 0;
  if (typeof data === 'object' && data !== null) {
    const numericValues = Object.values(data).filter(val => 
      typeof val === 'number' || !isNaN(parseFloat(val))
    );
    return numericValues.length > 0 ? numericValues[0] : 0;
  }
  return 0;
};

const KPICards = () => {
  const [kpiData, setKpiData] = useState({ averageAge: 0, averageOffices: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // En el useEffect
        const [averageAge, averageOffices] = await Promise.all([
        promedioAnios(),  // ← Sin parámetro
        promedioPorSedes()  // ← Sin parámetro
        ]);

        const ageValue = extractValue(averageAge);
        const officesValue = extractValue(averageOffices);

        setKpiData({ averageAge: ageValue, averageOffices: officesValue });
      } catch (error) {
        console.error('Error al obtener datos KPI:', error);
        setError('Error al cargar indicadores clave');
        setKpiData({ averageAge: 0, averageOffices: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  return (
    <div className="kpi-grid">
      <StatCard
        title="Promedio de Antigüedad"
        value={loading ? 'Cargando...' : Number(kpiData.averageAge).toFixed(1)}
        unit={loading ? '' : ' años'}
        icon="calendar"
        loading={loading}
      />
      <StatCard
        title="Promedio de Sedes"
        value={loading ? 'Cargando...' : Number(kpiData.averageOffices).toFixed(1)}
        unit={loading ? '' : ' sedes'}
        icon="building"
        loading={loading}
      />
    </div>
  );
};

export default KPICards;