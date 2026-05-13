const announcements = [
  {
    id: '1',
    title: 'New Office Policy',
    content: 'Please be informed that the office hours have been updated to 9:00 AM - 6:00 PM starting next Monday.',
    author: 'HR Department',
    date: '2026-05-05',
    type: 'POLICY'
  },
  {
    id: '2',
    title: 'Happy Birthday Mike!',
    content: 'Wishing a very happy birthday to our Senior Developer, Mike Ross!',
    author: 'Admin',
    date: '2026-05-04',
    type: 'CELEBRATION'
  },
  {
    id: '3',
    title: 'Company Outing',
    content: 'Join us for a team building event this Friday at the Beach Resort.',
    author: 'Team Lead',
    date: '2026-05-01',
    type: 'EVENT'
  }
];

exports.getAnnouncements = async (req, res) => {
  try {
    // In a real app, fetch from DB
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
