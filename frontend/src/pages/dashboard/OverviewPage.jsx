import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiLayout } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import StatsOverview from '../../components/dashboard/StatsOverview';
import AnalyticsSection from '../../components/dashboard/AnalyticsSection';
import { fetchGlobalStatsAPI, fetchHeatmapAPI } from '../../api/stats';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OverviewPage = () => {
  const [stats, setStats] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHeatmap, setLoadingHeatmap] = useState(true);
  const navigate = useNavigate();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchGlobalStatsAPI();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHeatmap = useCallback(async () => {
    try {
      setLoadingHeatmap(true);
      const data = await fetchHeatmapAPI();
      setHeatmapData(data);
    } catch (err) {
      console.error('Failed to fetch heatmap data:', err);
    } finally {
      setLoadingHeatmap(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadHeatmap();
  }, [loadStats, loadHeatmap]);

  return (
    <div className="space-y-10 pb-12">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-2 border-black">
        <div>
          <h1 className="text-4xl sm:text-6xl font-black text-black tracking-tight uppercase mb-3">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600 font-medium max-w-2xl">
            Welcome back! Here is a high-level view of your current mastery patterns and study trends.
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/flashcards')}
          className="group flex items-center gap-3 px-8 py-4 bg-[#ffb800] text-black font-black text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <FiLayout className="w-5 h-5" />
          Go to Library
        </button>
      </div>

      {/* Primary Analytics Section */}
      <section className="space-y-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-[#ffb800]"></div>
            <h2 className="text-xl font-black uppercase tracking-tight">At a Glance</h2>
          </div>
          {loading ? (
            <LoadingSpinner message="Calculating global metrics..." />
          ) : (
            <StatsOverview stats={stats} />
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-black"></div>
            <h2 className="text-xl font-black uppercase tracking-tight">Learning Insights</h2>
          </div>
          <AnalyticsSection 
            stats={stats} 
            loading={loading} 
            heatmapData={heatmapData} 
            loadingHeatmap={loadingHeatmap} 
          />
        </div>
      </section>
    </div>
  );
};

export default OverviewPage;
