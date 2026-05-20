const { Leave, WorkingConfig, Timesheet } = require('../services/db.service');
const mongoose = require('mongoose');

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
    const activeUserId = userId || req.user?.userId;

    if (!query) {
      return res.status(400).json({ message: 'Query string is required.' });
    }

    const text = query.toLowerCase().trim();

    // Helper: check whole-word presence to avoid partial matches (e.g. 'off' in 'office')
    const hasWord = (...words) => words.some(w => new RegExp(`\\b${w}\\b`).test(text));

    // 1. Natural Language command parsing: Timesheet Logging
    // Matches e.g., "log 8 hours on CMT HR Premium Replica Suite" or "log 6.5 hours Project Upgrade"
    const timesheetMatch = query.match(/log\s+(\d+(?:\.\d+)?)\s+hours?\s+(?:on\s+)?(.+)/i);
    if (timesheetMatch) {
      const hours = parseFloat(timesheetMatch[1]);
      const project = timesheetMatch[2].trim().replace(/['"]/g, ''); // strip quotes

      if (!activeUserId || !mongoose.isValidObjectId(activeUserId)) {
        return res.json({
          reply: `⚠️ I identified you want to log **${hours} hours** on **${project}**, but I couldn't resolve your active employee credentials. Please log in again.`
        });
      }

      // Automatically create a timesheet session in the DB
      const timesheet = new Timesheet({
        userId: activeUserId,
        organizationId,
        projectName: project,
        task: `Logged automatically via AI Chatbot Assistant`,
        hours: hours,
        date: new Date(),
        status: 'PENDING',
        notes: `Logged automatically via AI Chatbot Assistant`
      });
      await timesheet.save();

      return res.json({
        reply: `⏱️ **Timesheet Session Logged Successfully!**\n\n` +
               `I have parsed your request and logged **${hours} hours** on **${project}** for today.\n\n` +
               `- **Status**: \`PENDING APPROVAL\`\n` +
               `- **Activity Description**: *Logged automatically via AI Chatbot Assistant*\n\n` +
               `You can review, edit, or track this entry in the **Project Timesheets** tab. Let me know if you need to log more hours!`
      });
    }

    // 2. Fetch employee leave balance if requested
    if (hasWord('leave', 'balance', 'vacation', 'sick', 'casual', 'annual')) {
      let leaves = [];
      if (activeUserId && mongoose.isValidObjectId(activeUserId)) {
        leaves = await Leave.find({ userId: activeUserId, status: 'APPROVED' }).lean();
      }

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
               `*Total Available Leave Balance: **${totalBal} days**.*\n\n` +
               `Would you like me to help you apply for leave? You can do so directly in the **Leave Manager** tab!`
      });
    }

    // 3. Fetch holiday calendar
    if (hasWord('holiday', 'holidays', 'calendar', 'festivals', 'festival', 'day off', 'days off')) {
      let holidayText = `Here is the official **Holiday Calendar** for **2026**:\n\n`;
      HOLIDAY_CALENDAR.forEach(h => {
        holidayText += `- 📅 **${h.date}**: ${h.name} (${h.type.toLowerCase()})\n`;
      });
      holidayText += `\n*Note: Employees are entitled to all National holidays and any 2 Regional festival holidays.*`;
      return res.json({ reply: holidayText });
    }

    // 4. Fetch working hours / policy rules
    if (hasWord('hours', 'timing', 'timings', 'shift', 'schedule', 'work', 'office', 'clock', 'check-in', 'check in', 'checkin', 'attendance')) {
      const config = await WorkingConfig.findOne({ organizationId }).lean() || {
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

    // 5. Policy links
    if (hasWord('policy', 'policies', 'handbook', 'manual', 'rules', 'document', 'docs', 'travel', 'conduct', 'guidelines', 'it policy')) {
      let policyText = `Certainly! Here are the links to the core **CloudMojo HR Policies**:\n\n`;
      POLICY_LINKS.forEach(p => {
        policyText += `- 📄 [${p.name}](${p.url})\n`;
      });
      policyText += `\nLet me know if you need specific details on any policies!`;
      return res.json({ reply: policyText });
    }

    // 6. Default keyword match or fallback
    return res.json({
      reply: `Hi! I am your **CloudMojo HR Assistant**. I can help you with:\n\n` +
             `1. 🩺 **Leave Balances**: type *"How many sick leaves do I have?"*\n` +
             `2. 📅 **Holiday Calendar**: type *"Show company holidays"* or *"when is next holiday?"*\n` +
             `3. 🕒 **Working Hours**: type *"what are standard office timings?"*\n` +
             `4. 📄 **HR Policy Documents**: type *"show travel policy"* or *"IT code of conduct"*\n` +
             `5. ⏱️ **Log Timesheets**: type *"log 8 hours on Project Name"*\n\n` +
             `Feel free to ask me any of these questions or click one of the quick chips below!`
    });
  } catch (error) {
    res.status(500).json({ reply: 'Sorry, I encountered an internal error processing that FAQ.', error: error.message });
  }
};
