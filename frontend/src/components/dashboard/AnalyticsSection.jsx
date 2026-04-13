import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiLayers, FiCalendar } from 'react-icons/fi';

const STATUS_COLORS = {
  Mastered: '#22c55e', // Green
  Reviewing: '#ffb800', // Cuemath Yellow
  Learning: '#000000',  // Black
  New: '#94a3b8'        // Gray
};

const AnalyticsSection = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-black border-t-[#ffb800] animate-spin"></div>
        <p className="font-black uppercase text-xs tracking-widest">Analyzing Patterns...</p>
      </div>
    );
  }

  if (!stats) return null;

  const pieData = stats.breakdown.map(item => ({
    name: item._id,
    value: item.count
  }));

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Learning Curve Area Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <div className="flex items-center gap-2 mb-8">
            <FiTrendingUp className="w-5 h-5 text-[#ffb800]" />
            <h3 className="font-black uppercase tracking-tight">Learning Curve (Last 14 Days)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.history}>
                <defs>
                  <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffb800" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ffb800" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="_id" 
                  tick={{ fontSize: 10, fontWeight: 'bold' }}
                  tickFormatter={(str) => str.split('-').slice(1).join('/')}
                />
                <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ border: '2px solid black', borderRadius: 0, fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reviews" 
                  stroke="#000" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorReviews)" 
                  dot={{ r: 4, fill: '#000', strokeWidth: 0 }}
                  activeDot={{ r: 8, fill: '#000', stroke: '#ffb800', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Mastery Breakdown Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <div className="flex items-center gap-2 mb-8">
            <FiLayers className="w-5 h-5 text-[#ffb800]" />
            <h3 className="font-black uppercase tracking-tight">Mastery Breakdown</h3>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#000'} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ border: '2px solid black', borderRadius: 0, fontWeight: 'bold' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Retention Performance Bar Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
      >
        <div className="flex items-center gap-2 mb-8">
          <FiCalendar className="w-5 h-5 text-[#ffb800]" />
          <h3 className="font-black uppercase tracking-tight">Average Retention Difficulty</h3>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.history}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="_id" 
                tick={{ fontSize: 10, fontWeight: 'bold' }}
                tickFormatter={(str) => str.split('-').slice(1).join('/')}
              />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10, fontWeight: 'bold' }} />
              <Tooltip 
                 contentStyle={{ border: '2px solid black', borderRadius: 0, fontWeight: 'bold' }}
              />
              <Bar dataKey="avgRating" fill="#ffb800" stroke="#000" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsSection;
