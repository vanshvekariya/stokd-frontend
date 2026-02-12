import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
// import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { dashboardStats } from '../../services/admin.services';
import Loader from '../../components/loader/Loader';
import {
  People as PeopleIcon,
  Restaurant as RestaurantIcon,
  Factory as FactoryIcon,
  // AssignmentLate as AssignmentLateIcon,
  // BarChart as BarChartIcon,
  // DonutLarge as DonutLargeIcon,
  // FlashOn as FlashOnIcon,
  // LocalFireDepartment as LocalFireDepartmentIcon,
  // LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';

// Enhanced Card components with better styling
const Card = ({ children, className = '', hover = false }) => (
  <div
    className={`bg-white rounded-xl shadow-lg border border-gray-100 ${hover ? 'hover:shadow-xl hover:scale-105 transition-all duration-300' : ''} ${className}`}
  >
    {children}
  </div>
);

// const CardHeader = ({ children }) => <div className="mb-4">{children}</div>;

// const CardTitle = ({ children, icon, subtitle }) => (
//   <div className="flex items-center justify-between mb-2">
//     <div>
//       <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
//         {icon && <span className="text-2xl">{icon}</span>}
//         {children}
//       </h3>
//       {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
//     </div>
//   </div>
// );

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardStats();
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loader />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </Card>
      </div>
    );
  }

  // Data for bar chart (original style)
  const barChartData = {
    labels: ['Users', 'Restaurants', 'Suppliers'],
    datasets: [
      {
        label: 'Total',
        data: [stats.totalUsers, stats.totalRestaurants, stats.totalSuppliers],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Active',
        data: [
          stats.activeUsers,
          stats.activeRestaurants,
          stats.activeSuppliers,
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  };

  // Data for pie chart (original style)
  const pieChartData = {
    labels: ['Complete Profiles', 'Incomplete Profiles'],
    datasets: [
      {
        data: [
          stats.totalUsers - stats.incompleteUserProfileCount,
          stats.incompleteUserProfileCount,
        ],
        backgroundColor: ['#10B981', '#F59E0B'],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="px-1 py-4 pb-8 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Dashboard Overview
            </h1>
          </div>
        </div>
      </div>
      <div className="px-1 py-4">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            change={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% active`}
            icon={<PeopleIcon fontSize="large" />}
            gradient="from-blue-500 to-blue-600"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
            onClick={() => navigate(paths.admin.users)}
          />
          <StatCard
            title="Total Restaurants"
            value={stats.totalRestaurants}
            change={`${Math.round((stats.activeRestaurants / stats.totalRestaurants) * 100)}% active`}
            icon={<RestaurantIcon fontSize="large" />}
            gradient="from-green-500 to-green-600"
            bgColor="bg-green-50"
            textColor="text-green-600"
            onClick={() => navigate(paths.admin.restaurants)}
          />
          <StatCard
            title="Total Suppliers"
            value={stats.totalSuppliers}
            change={`${Math.round((stats.activeSuppliers / stats.totalSuppliers) * 100)}% active`}
            icon={<FactoryIcon fontSize="large" />}
            gradient="from-purple-500 to-purple-600"
            bgColor="bg-purple-50"
            textColor="text-purple-600"
            onClick={() => navigate(paths.admin.suppliers)}
        />
          {/* <StatCard
            title="Incomplete Profiles"
            value={stats.incompleteUserProfileCount}
            change={`${Math.round((stats.incompleteUserProfileCount / stats.totalUsers) * 100)}% of total`}
            icon={<AssignmentLateIcon fontSize="large" />}
            variant="warning"
            gradient="from-amber-500 to-orange-500"
            bgColor="bg-amber-50"
            textColor="text-amber-600"
          /> */}
        </div>

        {/* Original Charts Row */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <Card hover={true} className="overflow-hidden">
            <CardContent>
              <CardTitle
                icon={<BarChartIcon />}
                subtitle="Compare total registrations vs active users"
              >
                Active vs Total Count
              </CardTitle>
              <div className="h-80 mt-4">
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card hover={true} className="overflow-hidden">
            <CardContent>
              <CardTitle
                icon={<DonutLargeIcon />}
                subtitle="Profile completion status across all users"
              >
                User Profile Completion
              </CardTitle>
              <div className="h-80 flex items-center justify-center mt-4">
                <div className="w-64 h-64">
                  <Pie
                    data={pieChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Enhanced Additional Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            description="Currently active platform users"
            icon={<FlashOnIcon fontSize="large" />}
            variant="success"
            compact
            gradient="from-emerald-500 to-teal-500"
            bgColor="bg-emerald-50"
            textColor="text-emerald-600"
            onClick={() => navigate('/admin/users')}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          />
          <StatCard
            title="Active Restaurants"
            value={stats.activeRestaurants}
            description="Currently active restaurants"
            icon={<LocalFireDepartmentIcon fontSize="large" />}
            variant="success"
            compact
            gradient="from-blue-500 to-indigo-500"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard
            title="Active Suppliers"
            value={stats.activeSuppliers}
            description="Currently active suppliers"
            icon={<LocalShippingIcon fontSize="large" />}
            variant="success"
            compact
            gradient="from-violet-500 to-purple-500"
            bgColor="bg-violet-50"
            textColor="text-violet-600"
          />
        </div> */}
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  change,
  description,
  icon,
  variant = 'default',
  compact = false,
  gradient,
  bgColor,
  textColor,
  onClick,
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-100',
    success: 'bg-white border border-green-100',
    warning: 'bg-white border border-amber-100',
    danger: 'bg-white border border-red-100',
  };

  return (
    <div 
      className={`${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <Card
        className={`${variantClasses[variant]} hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden relative`}
      >
      {/* Gradient background accent */}
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`}
      ></div>

      <CardContent className={`${compact ? 'p-5' : 'p-6'} relative`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p
              className={`text-sm font-semibold text-gray-500 ${compact ? 'mb-2' : 'mb-3'} tracking-wide`}
            >
              {title}
            </p>
            <p
              className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 ${compact ? 'mb-2' : 'mb-3'}`}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change && (
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs">📈</span>
                <p className="text-sm text-gray-600 font-medium">{change}</p>
              </div>
            )}
            {description && (
              <p className="text-sm text-gray-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {icon && (
            <div
              className={`p-4 rounded-xl ${bgColor} border-2 border-white shadow-lg`}
            >
              <span className="text-3xl block">{icon}</span>
            </div>
          )}
        </div>

        {/* Bottom accent line */}
        <div
          className={`absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r ${gradient} opacity-20`}
        ></div>
      </CardContent>
    </Card>
    </div>
  );
};

export default Dashboard;
