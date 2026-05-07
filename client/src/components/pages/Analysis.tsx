import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const eventData = [
  { month: 'Jan', events: 45, fatalities: 320 },
  { month: 'Feb', events: 52, fatalities: 280 },
  { month: 'Mar', events: 48, fatalities: 450 },
  { month: 'Apr', events: 61, fatalities: 520 },
  { month: 'May', events: 55, fatalities: 380 },
]

const categoryData = [
  { name: 'Battle', value: 35, fill: '#ef4444' },
  { name: 'Violence', value: 25, fill: '#f97316' },
  { name: 'Protests', value: 20, fill: '#eab308' },
  { name: 'Looting', value: 12, fill: '#06b6d4' },
  { name: 'Other', value: 8, fill: '#8b5cf6' },
]

const trendData = [
  { date: 'Week 1', incidents: 12 },
  { date: 'Week 2', incidents: 19 },
  { date: 'Week 3', incidents: 15 },
  { date: 'Week 4', incidents: 28 },
  { date: 'Week 5', incidents: 22 },
]

export default function Analysis() {
  return (
    <div className="w-full h-fit flex flex-col items-center gap-8 py-8">
      <div className="w-[95%]">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Analysis Dashboard</h1>
        <p className="text-slate-400">Real-time conflict event analytics and trends</p>
      </div>

      <div className="w-[95%] grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Events Over Time */}
        <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Events & Fatalities Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="events" fill="#3b82f6" name="Events" />
              <Bar dataKey="fatalities" fill="#ef4444" name="Fatalities" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Event Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="bg-slate-950/80 border border-slate-800/70 rounded-xl p-6 shadow-2xl md:col-span-2">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Weekly Incident Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="incidents"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
                name="Incidents"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
