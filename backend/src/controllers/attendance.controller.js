const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const parseTime = (timeStr) => {
  if (!timeStr) return { hours: 0, minutes: 0 };
  
  const ampmRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
  const match = timeStr.match(ampmRegex);
  
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    return { hours, minutes };
  }
  
  // Fallback to 24h format
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours: hours || 0, minutes: minutes || 0 };
};

exports.checkIn = async (req, res) => {
  try {
    const { userId, location } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeSession = await prisma.attendance.findFirst({
      where: {
        userId,
        checkOut: null,
      },
    });

    if (activeSession) {
      return res.status(400).json({ message: 'You have an active session. Please check out first.' });
    }

    const checkInTime = new Date();
    const hours = checkInTime.getHours();
    const minutes = checkInTime.getMinutes();
    
    let status = 'PRESENT';

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        checkIn: checkInTime,
        location,
        status: status,
        date: new Date(),
      },
    });

    res.status(201).json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { userId } = req.body;

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        checkOut: null,
      },
      orderBy: {
        checkIn: 'desc',
      },
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No active check-in found' });
    }

    const checkInTime = new Date(attendance.checkIn);
    const checkOutTime = new Date();
    const durationMinutes = (checkOutTime - checkInTime) / (1000 * 60);

    // Fetch config
    const config = await prisma.workingConfig.findUnique({ where: { id: 'default' } }) || { minPresentMinutes: 500 };
    
    let status = attendance.status;
    if (durationMinutes >= config.minPresentMinutes) {
      status = 'PRESENT';
    } else if (durationMinutes >= (config.requiredHours * 60 / 2)) {
      status = 'HALF_DAY';
    } else {
      status = 'ABSENT'; // Or keep LATE/HALF_DAY? Let's say ABSENT if very low
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: { 
        checkOut: checkOutTime,
        status: status
      },
    });

    res.json({ message: 'Checked out successfully', attendance: updatedAttendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAttendanceHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { checkIn: 'desc' },
      take: 30,
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMonthlyReportData = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }
    
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const data = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            department: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { user: { firstName: 'asc' } }
      ],
    });

    // Fetch config for enrichment
    const config = await prisma.workingConfig.findUnique({ where: { id: 'default' } }) || { 
      requiredHours: 9, 
      minPresentMinutes: 500 
    };

    // Enrich data with detailed status (Late, Half-day)
    const enrichedData = data.map(record => {
      let detailedStatus = record.status;
      
      if (record.checkIn && !record.checkOut) {
        detailedStatus = record.status;
      }

      if (record.checkIn && record.checkOut) {
        const duration = (new Date(record.checkOut) - new Date(record.checkIn)) / (1000 * 60);
        if (duration >= config.minPresentMinutes) {
          detailedStatus = 'PRESENT';
        } else if (duration >= (config.requiredHours * 60 / 2)) {
          detailedStatus = 'HALF_DAY';
        } else {
          detailedStatus = 'ABSENT';
        }
      }

      return {
        ...record,
        detailedStatus
      };
    });

    res.json(enrichedData);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch report data', error: error.message });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }
    
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Invalid month or year' });
    }

    const data = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true,
            department: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { user: { firstName: 'asc' } }
      ],
    });

    // Create CSV content
    let csv = 'Employee ID,Name,Department,Date,Check-In,Check-Out,Status,Location\n';
    
    data.forEach(record => {
      const dateStr = record.date.toISOString().split('T')[0];
      const checkInStr = record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : '-';
      const checkOutStr = record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-';
      
      csv += `${record.user.employeeId},${record.user.firstName} ${record.user.lastName},${record.user.department},${dateStr},${checkInStr},${checkOutStr},${record.status},${record.location || 'Office'}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`Attendance_Report_${month}_${year}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
};

exports.regularize = async (req, res) => {
  try {
    const { userId, date, checkIn, checkOut, reason } = req.body;
    
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: new Date(date),
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        status: 'PRESENT',
        location: 'Regularized',
      }
    });

    res.status(201).json({ message: 'Attendance regularized successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Regularization failed', error: error.message });
  }
};

