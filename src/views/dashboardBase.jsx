// components/dashboard/DashboardBase.jsx
import React from 'react';
import Sidebar from '../components/dashboardBase/Sidebar';
import KPICards from '../components/dashboardBase/KPICards';
import CompanySizes from '../components/dashboardBase/CompanySizes';
import LineChart from '../components/dashboardBase/LineChart';
import BarChart from '../components/dashboardBase/BarChart';
import DoughnutChart from '../components/dashboardBase/DoughnutChart';
import BoliviaMap from '../components/dashboardBase/BoliviaMap';
import Icon from '../components/dashboardBase/Icon';
import '../css/dashboardBase.css';

const DashboardBase = () => {
  return (
    <div className="dashboard-app">
      <Sidebar />

      <div className="dashboard-base">
        <header className="dashboard-header">
          <h1 className="header-title">Dashboard de Estadísticas Empresariales</h1>
          <p className="header-subtitle">Panel de control integral para el análisis de datos empresariales</p>
        </header>

        <div className="dashboard-layout">
          {/* Fila 1: KPIs */}
          <div className="dashboard-row">
            <div className="dashboard-block">
              <h2 className="block-title">
                <Icon name="statistics" />
                Indicadores Clave
              </h2>
              <KPICards />
            </div>
          </div>

          {/* Fila 2: Tamaños de empresa */}
          <div className="dashboard-row">
            <div className="dashboard-block">
              <h2 className="block-title">
                <Icon name="office" />
                Distribución por Tamaño
              </h2>
              <CompanySizes />
            </div>
          </div>

          {/* Fila 3: Gráficos principales */}
          <div className="dashboard-row chart-grid">
          <div className="dashboard-row">
            <div className="dashboard-block">
              <h2 className="block-title">
                <Icon name="growth" />
                Empresas Creadas por Año
              </h2>
              <LineChart 
                title=""
                xAxisLabel="Años" 
                yAxisLabel="Cantidad de Empresas" 
              />
            </div>
          </div>
          </div>

          {/* Fila 4: Gráficos de dona */}
          <div className="dashboard-row chart-grid">
            <div className="dashboard-block">
              <h2 className="block-title">
                <Icon name="sustainability" />
                Compromiso ODS
              </h2>
              <DoughnutChart 
                type="ods" 
                title="Compromiso con los ODS" 
              />
            </div>
            <div className="dashboard-block">
              <h2 className="block-title">
                <Icon name="factory" />
                Hitos empresariales por Año
              </h2>
                <LineChart 
                  title="Evolución de Hitos por Año"
                  xAxisLabel="Años"
                  yAxisLabel="Cantidad de Hitos"
                  chartType="hitos"
                />
            </div>
          </div>

          {/* Fila 5: Gráficos de dona */}
          <div className="dashboard-row chart-grid">
            <div className="dashboard-block">
              <h2 className="block-title">
                <Icon name="factory" />
                Empresas por Sector Económico
              </h2>
              <BarChart 
                title="Sectores Económicos"
                xAxisLabel="Sectores" 
                yAxisLabel="Cantidad" 
              />
            </div>
          </div>

          {/* Fila 6: Mapa */}
          <div className="dashboard-row">
            <div className="dashboard-block">
              <h2 className="block-title">
                <Icon name="map" />
                Empresas por Departamento
              </h2>
              <BoliviaMap/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBase;