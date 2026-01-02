export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Devices" value="124" trend="+12%" color="bg-blue-500" />
        <StatCard title="Active Users" value="45" trend="+5%" color="bg-green-500" />
        <StatCard title="Online Now" value="32" trend="Stable" color="bg-purple-500" />
        <StatCard title="Alerts" value="3" trend="-2" color="bg-red-500" />
      </div>

      {/* Placeholder for recent activity or map */}
      <div className="mt-8 h-64 rounded-lg border-2 border-dashed border-gray-200 bg-white p-4">
        <p className="text-center text-gray-500">System Activity Chart Placeholder</p>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, color }: any) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-full opacity-20 ${color}`}></div>
      </div>
      <div className="mt-4">
        <span className="text-sm font-medium text-green-600">{trend}</span>
        <span className="ml-2 text-sm text-gray-400">vs last month</span>
      </div>
    </div>
  );
}
