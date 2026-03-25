import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { AdminAccessSeriesPoint } from '../../types/admin';

interface AccessLineChartProps {
  points: AdminAccessSeriesPoint[];
}

export const AccessLineChart = ({ points }: AccessLineChartProps) => {
  const categories = points.map((point) => point.label);
  const values = points.map((point) => point.total);

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height: 320,
      toolbar: { show: false },
      fontFamily: 'Open Sans, Segoe UI, sans-serif',
      zoom: { enabled: false },
      parentHeightOffset: 0,
    },
    colors: ['#159A9C'],
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.42,
        opacityTo: 0.04,
        stops: [0, 90, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4,
      xaxis: {
        lines: { show: false },
      },
    },
    markers: {
      size: 0,
      hover: {
        size: 5,
      },
    },
    tooltip: {
      theme: 'light',
      fixed: {
        enabled: false,
      },
      y: {
        formatter: (value) => `${value} acessos`,
      },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: {
          colors: ['#6B7280'],
          fontSize: '12px',
        },
      },
    },
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="w-full overflow-hidden">
        <Chart
          options={options}
          series={[{ name: 'Acessos', data: values }]}
          type="area"
          width="100%"
          height={320}
        />
      </div>
    </div>
  );
};
