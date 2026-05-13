exports.getDashboardData = async (req, res) => {
  try {
    // Mock data for now
    const dashboardData = {
      user: {
        firstName: 'John',
        lastName: 'Doe',
      },
      stats: {
        leaveBalance: 12,
        attendance: '22/24',
        attendancePercentage: 92,
      },
      upcomingHolidays: [
        { id: '1', name: 'Eid-ul-Fitr', date: '2026-05-15', day: 'Friday' },
        { id: '2', name: 'Independence Day', date: '2026-08-15', day: 'Saturday' },
      ],
      recentActivity: [
        { id: '1', type: 'ATTENDANCE', message: 'Checked in at 09:15 AM today', status: 'SUCCESS' },
        { id: '2', type: 'LEAVE', message: 'Leave approved by Admin (12 May)', status: 'PRIMARY' },
      ],
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
