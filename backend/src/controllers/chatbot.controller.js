const mockDb = require('../services/mock.service');
const prisma = require('../services/prisma.service');

const HOLIDAY_CALENDAR = [
  { date: '2026-01-01', name: 'New Year Day', type: 'NATIONAL' },
  { date: '2026-01-26', name: 'Republic Day', type: 'NATIONAL' },
  { date: '2026-03-02', name: 'Holi Festival', type: 'REGIONAL' },
  { date: '2026-05-01', name: 'Labor Day', type: 'GLOBAL' },
  { date: '2026-08-15', name: 'Independence Day', type: 'NATIONAL' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'NATIONAL' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'GLOBAL' }
];

const POLICY_LINKS = [
  { name: 'Employee Code of Conduct', url: '/mock/policies/code_of_conduct.pdf' },
  { name: 'Hybrid Work Policy Guidelines', url: '/mock/policies/hybrid_work.pdf' },
  { name: 'Travel & Reimbursement Policy', url: '/mock/policies/travel_policy.pdf' },
  { name: 'IT Assets & Information Security', url: '/mock/policies/it_policy.pdf' }
];

exports.askChatbot = async (req, res) => {
  try {
    const { query, userId } = req.body;
    const organizationId = req.organizationId;

    if (!query) {
      return res.status(400).json({ message: 'Query string is required.' });
    }

    const text = query.toLowerCase().trim();

    // 1. Fetch employee leave balance if requested
    if (text.includes('leave') || text.includes('balance') || text.includes('vacation') || text.includes('sick')) {
      const leaves = mockDb.find('leaves', { userId, status: 'APPROVED' }) || [];
      
      // Assume standard yearly leaves: Sick = 10, Casual = 12, Annual = 15
      let sickUsed = 0;
      let casualUsed = 0;
      let annualUsed = 0;

      leaves.forEach(l => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (l.type === 'SICK') sickUsed += diffDays;
        else if (l.type === 'CASUAL') casualUsed += diffDays;
        else annualUsed += diffDays;
      });

      const sickBal = Math.max(0, 10 - sickUsed);
      const casualBal = Math.max(0, 12 - casualUsed);
      const annualBal = Math.max(0, 15 - annualUsed);
      const totalBal = sickBal + casualBal + annualBal;

      return res.json({
        reply: `Hello! I checked your profile. Here is your current **Leave Balance**:\n\n` +
               `- 🩺 **Sick Leave**: **${sickBal} days** left (Used: ${sickUsed}/10)\n` +
               `- 🎈 **Casual Leave**: **${casualBal} days** left (Used: ${casualUsed}/12)\n` +
               `- ✈️ **Annual/Vacation**: **${annualBal} days** left (Used: ${annualUsed}/15)\n\n` +
               `*Total Available Leave Balance: **${totalBal} days**.*\n` +
               `Would you like me to help you apply for leave?`
      });
    }

    // 2. Fetch holiday calendar
    if (text.includes('holiday') || text.includes('calendar') || text.includes('festivals') || text.includes('off')) {
      let holidayText = `Here is the official **Holiday Calendar** for **2026**:\n\n`;
      HOLIDAY_CALENDAR.forEach(h => {
        holidayText += `- 📅 **${h.date}**: ${h.name} (${h.type.toLowerCase()})\n`;
      });
      holidayText += `\n*Note: Employees are entitled to all National holidays and any 2 Regional festival holidays.*`;
      return res.json({ reply: holidayText });
    }

    // 3. Fetch working hours / policy rules
    if (text.includes('hours') || text.includes('timing') || text.includes('shift') || text.includes('work')) {
      const config = mockDb.findOne('configs', { organizationId }) || {
        windowStart: '09:00 AM',
        windowEnd: '06:00 PM',
        requiredHours: 9
      };

      return res.json({
        reply: `Under CloudMojo Tech configurations, your active **Working Schedule** is:\n\n` +
               `- 🕒 **Standard Shift Window**: **${config.windowStart} - ${config.windowEnd}**\n` +
               `- ⏱️ **Required Logged Hours**: **${config.requiredHours} hours per day**\n` +
               `- ⏳ **Min Presence for Attendance**: **8 hours** (including 40 mins lunch/breaks)\n\n` +
               `To check-in or out, please use the **Time & Attendance** clock widget on your dashboard.`
      });
    }

    // 4. Policy links
    if (text.includes('policy') || text.includes('handbook') || text.includes('manual') || text.includes('rules')) {
      let policyText = `Certainly! Here are the links to the core **CloudMojo HR Policies**:\n\n`;
      POLICY_LINKS.forEach(p => {
        policyText += `- 📄 [${p.name}](${p.url})\n`;
      });
      policyText += `\nLet me know if you need specific details on any policies!`;
      return res.json({ reply: policyText });
    }

    // 5. Default keyword match or fallback
    return res.json({
      reply: `Hi! I am your **CloudMojo HR Assistant**. I can help you with:\n\n` +
             `1. **Leave Balances**: type *"How many sick leaves do I have?"*\n` +
             `2. **Holiday Calendar**: type *"Show company holidays"* or *"when is next holiday?"*\n` +
             `3. **Working Hours**: type *"what are standard office timings?"*\n` +
             `4. **HR Policy Documents**: type *"show travel policy"* or *"IT code of conduct"*\n\n` +
             `Feel free to ask me any of these questions!`
    });
  } catch (error) {
    res.status(500).json({ reply: 'Sorry, I encountered an internal error processing that FAQ.', error: error.message });
  }
};
