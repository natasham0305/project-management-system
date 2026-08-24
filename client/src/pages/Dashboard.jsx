import Card from '../components/Card';

function Dashboard() {
  const statistics = [
    {
      title: 'Projects',
      value: 12
    },
    {
      title: 'Tasks',
      value: 45
    },
    {
      title: 'Completed',
      value: 28
    },
    {
      title: 'Overdue',
      value: 3
    }
  ];

  return (
    <div className="main-content">
      <h1>Dashboard</h1>

      <div className="dashboard-cards">
        {statistics.map((stat) => (
          <Card
            key={stat.title}
            title={stat.title}
            value={stat.value}
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;