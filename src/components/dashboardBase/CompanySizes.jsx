// components/dashboard/CompanySizes.jsx
import React, { useEffect, useState } from 'react';
import { promedioPorTamanio } from '../../services/dashboardBaseService';
import StatCard from './StatCard';
import '../../css/dashboardBase.css';

const CompanySizes = () => {
  const [companySizes, setCompanySizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await promedioPorTamanio();
        
        // El endpoint devuelve { "tamanios": [...] }
        // Extraemos el array de tamanios
        const tamaniosData = response.tamanios || [];
        
        // Mapeamos los datos al formato que necesita StatCard
        const normalizedSizes = tamaniosData.map(item => ({
          label: item.nombreTamanio || 'Tamaño',
          value: item.porcentaje || 0, // Usamos el porcentaje como valor principal
          unit: '%',
          total: item.total || 0, // Guardamos el total por si lo necesitas
          id: item.idTamanio // Guardamos el ID por si lo necesitas
        }));
        
        setCompanySizes(normalizedSizes);
      } catch (error) {
        console.error('Error al obtener tamaños de empresa:', error);
        setError('Error al cargar datos de tamaños');
        setCompanySizes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid-4cols">
        {Array(4).fill(0).map((_, index) => (
          <StatCard key={index} loading={true} />
        ))}
      </div>
    );
  }

  if (error || !Array.isArray(companySizes) || companySizes.length === 0) {
    return (
      <div className="error-message">
        No hay datos disponibles de tamaños de empresa
      </div>
    );
  }

  return (
    <div className="grid-4cols">
      {companySizes.map((item, index) => (
        <StatCard
          key={item.id || index}
          title={item.label}
          value={item.value}
          unit={item.unit}
          icon="office"
        />
      ))}
    </div>
  );
};

export default CompanySizes;