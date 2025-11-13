// components/dashboardBase/BoliviaMap.jsx
import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HC_map from "highcharts/modules/map";
import "../../css/boliviaMap.css";
import mapDataBolivia from "@highcharts/map-collection/countries/bo/bo-all.geo.json";
import { empresasPorDepartamento } from '../../services/dashboardBaseService';

// Inicializar el módulo de mapas
if (typeof HC_map === "function") {
  HC_map(Highcharts);
}

// Mapeo de nombres para normalizar diferencias entre el backend y Highcharts
const departmentNameMapping = {
  'El Beni': 'Beni',
  'Chuquisaca': 'Chuquisaca', 
  'Cochabamba': 'Cochabamba',
  'La Paz': 'La Paz',
  'Oruro': 'Oruro',
  'Pando': 'Pando',
  'Potosí': 'Potosí',
  'Santa Cruz': 'Santa Cruz',
  'Tarija': 'Tarija'
};

const BoliviaMap = ({
  title = "",
  width = 600,
  height = 500,
  className = "",
}) => {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await empresasPorDepartamento();
        
        console.log('Datos recibidos del backend:', response);
        
        const departamentosData = response.departamentos || [];
        
        // Crear un mapa rápido de los datos del backend para búsqueda eficiente
        const backendDataMap = {};
        departamentosData.forEach(dept => {
          backendDataMap[dept.nombreDepartamento] = dept.cantidadEmpresas;
          console.log(`Backend: ${dept.nombreDepartamento} -> ${dept.cantidadEmpresas}`);
        });

        // Transformar datos del backend al formato que necesita el mapa
        const transformedData = mapDataBolivia.features.map((feature) => {
          const hcName = feature.properties.name;
          const normalizedName = departmentNameMapping[hcName] || hcName;
          
          const cantidadEmpresas = backendDataMap[normalizedName] || 0;
          
          console.log(`Highcharts: ${hcName} -> Normalizado: ${normalizedName} -> Valor: ${cantidadEmpresas}`);

          return {
            "hc-key": feature.properties["hc-key"],
            name: hcName, // Mantener el nombre original de Highcharts
            value: cantidadEmpresas,
          };
        });

        console.log('Datos transformados finales:', transformedData);
        setMapData(transformedData);
      } catch (error) {
        console.error('Error al obtener datos del mapa:', error);
        setError('Error al cargar datos del mapa');
        setMapData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcular el valor máximo para la escala de colores
  const maxValue = Math.max(...mapData.map(item => item.value), 1);

  const options = {
    chart: {
      map: mapDataBolivia,
      height,
      width,
      backgroundColor: "#F4E9D7",
      borderRadius: 12,
    },
    title: {
      text: title,
      style: {
        color: '#072D42',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '18px',
        fontWeight: 'bold'
      }
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: "bottom",
        theme: {
          fill: '#F29E38',
          stroke: '#FFFFFF',
          'stroke-width': 1,
          style: {
            color: '#FFFFFF'
          },
          states: {
            hover: {
              fill: '#072D42'
            },
            select: {
              fill: '#072D42'
            }
          }
        }
      },
    },
    colorAxis: {
      min: 0,
      max: maxValue,
      minColor: "#D9CBBF",
      maxColor: "#072D42",
    },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      backgroundColor: 'rgba(255,255,255,0.8)',
      borderColor: '#D9CBBF',
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      itemStyle: {
        color: '#464E59',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px'
      }
    },
    series: [
      {
        data: mapData,
        mapData: mapDataBolivia,
        joinBy: "hc-key",
        name: "Cantidad de Empresas",
        states: {
          hover: {
            color: "#F29E38",
            borderColor: '#072D42',
            brightness: 0.1
          },
        },
        dataLabels: {
          enabled: true,
          format: "{point.name}",
          style: {
            color: '#072D42',
            textOutline: '1px contrast',
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            fontWeight: '500'
          }
        },
        tooltip: {
          headerFormat: '',
          pointFormat: '<b>{point.name}</b><br>Empresas: <b>{point.value}</b>',
          backgroundColor: 'rgba(7, 45, 66, 0.95)',
          borderColor: '#F29E38',
          borderRadius: 8,
          style: {
            color: '#F4E9D7',
            fontFamily: 'Inter, sans-serif'
          }
        },
      },
    ],
    credits: {
      enabled: false
    }
  };

  if (loading) {
    return (
      <div className="bolivia-map-loading">
        <div className="loading-spinner"></div>
        <p>Cargando mapa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bolivia-map-error">
        <div className="error-icon">⚠️</div>
        <h3>Error al cargar el mapa</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`bolivia-map-container ${className}`}>
      <div className="bolivia-map" style={{ width, height }}>
        <HighchartsReact
          constructorType="mapChart"
          highcharts={Highcharts}
          options={options}
        />
      </div>
      
      {/* Leyenda adicional con estadísticas */}
      {mapData.length > 0 && (
        <div className="map-stats">
          <div className="stats-summary">
            <span className="stat-label">Total empresas mapeadas:</span>
            <span className="stat-value">
              {mapData.reduce((sum, item) => sum + item.value, 0)}
            </span>
          </div>
          <div className="departments-list">
            {mapData
              .filter(item => item.value > 0)
              .sort((a, b) => b.value - a.value)
              .map((item, index) => (
                <div key={index} className="department-stat">
                  <span className="dept-name">{item.name}:</span>
                  <span className="dept-value">{item.value}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default BoliviaMap;