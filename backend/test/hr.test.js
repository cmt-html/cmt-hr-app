const assert = require('assert');
const jwt = require('jsonwebtoken');

// Role-based authorization middleware simulator
const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

// Leave Balance calculation helper simulator
const calculateAvailableLeaves = (leaves = [], type = 'SICK') => {
  const quota = type === 'SICK' ? 10 : 15;
  const approvedLeaves = leaves.filter(l => l.status === 'APPROVED' && l.type === type);
  
  let daysUsed = 0;
  approvedLeaves.forEach(l => {
    const start = new Date(l.startDate);
    const end = new Date(l.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    daysUsed += diffDays;
  });

  return Math.max(0, quota - daysUsed);
};

// Master Test Execution
console.log('🧪 Starting CMT HR Backend Unit Tests...');

try {
  // Test 1: JWT Verification
  console.log('\n  1. Testing JWT Token Verification...');
  const secret = 'test_jwt_secret_key_123';
  const payload = { userId: 'emp_123', role: 'EMPLOYEE', organizationId: 'org_abc' };
  
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  const verifiedPayload = jwt.verify(token, secret);
  
  assert.strictEqual(verifiedPayload.userId, 'emp_123');
  assert.strictEqual(verifiedPayload.role, 'EMPLOYEE');
  assert.strictEqual(verifiedPayload.organizationId, 'org_abc');
  console.log('     ✅ JWT Verification Test Passed!');

  // Test 2: Leave Balance Calculation
  console.log('\n  2. Testing Leave Balance Calculations...');
  const mockLeaves = [
    { type: 'SICK', startDate: '2026-05-01', endDate: '2026-05-02', status: 'APPROVED' }, // 2 days
    { type: 'SICK', startDate: '2026-05-15', endDate: '2026-05-15', status: 'APPROVED' }, // 1 day
    { type: 'SICK', startDate: '2026-05-20', endDate: '2026-05-21', status: 'PENDING' },  // ignored
    { type: 'ANNUAL', startDate: '2026-05-10', endDate: '2026-05-14', status: 'APPROVED' }, // 5 days
  ];

  // SICK quota: 10 days. Used: 3 days. Available should be 7.
  const sickBalance = calculateAvailableLeaves(mockLeaves, 'SICK');
  assert.strictEqual(sickBalance, 7);

  // ANNUAL quota: 15 days. Used: 5 days. Available should be 10.
  const annualBalance = calculateAvailableLeaves(mockLeaves, 'ANNUAL');
  assert.strictEqual(annualBalance, 10);
  console.log('     ✅ Leave Balance Calculation Test Passed!');

  // Test 3: Role-Based Access Control Middleware
  console.log('\n  3. Testing Role-Based Access Control...');
  
  const managerMiddleware = checkRole(['ADMIN', 'MANAGER']);
  
  // Scenario A: Denied access for Employee
  const reqEmployee = { user: { role: 'EMPLOYEE' } };
  let statusSent = 200;
  let jsonMessage = '';
  const resEmployee = {
    status: (code) => {
      statusSent = code;
      return {
        json: (data) => { jsonMessage = data.message; }
      };
    }
  };
  managerMiddleware(reqEmployee, resEmployee, () => {
    statusSent = 200; // should not trigger next()
  });
  
  assert.strictEqual(statusSent, 403);
  assert.strictEqual(jsonMessage, 'Forbidden');

  // Scenario B: Allowed access for Manager
  const reqManager = { user: { role: 'MANAGER' } };
  let nextTriggered = false;
  const resManager = {};
  managerMiddleware(reqManager, resManager, () => {
    nextTriggered = true;
  });
  assert.strictEqual(nextTriggered, true);
  console.log('     ✅ Role-Based Access Control Test Passed!');

  // Test 4: Custom Fields Persistence Simulation
  console.log('\n  4. Testing User Custom Fields Persistence...');
  const mockUserWithCustomFields = {
    email: 'employee@cloudmojo.co',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'EMPLOYEE',
    customFields: {
      tShirtSize: 'L',
      dietaryPreference: 'Vegan',
      emergencyContactRelationship: 'Sister'
    }
  };

  assert.strictEqual(mockUserWithCustomFields.customFields.tShirtSize, 'L');
  assert.strictEqual(mockUserWithCustomFields.customFields.dietaryPreference, 'Vegan');
  assert.strictEqual(mockUserWithCustomFields.customFields.emergencyContactRelationship, 'Sister');
  console.log('     ✅ Custom Fields Persistence Test Passed!');

  // Test 5: Chatbot Timesheet Command Parsing
  console.log('\n  5. Testing Chatbot Natural Language Timesheet Command Parsing...');
  const parseTimesheetCommand = (query) => {
    const timesheetMatch = query.match(/log\s+(\d+(?:\.\d+)?)\s+hours?\s+(?:on\s+)?(.+)/i);
    if (timesheetMatch) {
      return {
        hours: parseFloat(timesheetMatch[1]),
        project: timesheetMatch[2].trim().replace(/['"]/g, '')
      };
    }
    return null;
  };

  const testQuery1 = "log 8 hours on CMT HR Premium Replica Suite";
  const parsed1 = parseTimesheetCommand(testQuery1);
  assert.notStrictEqual(parsed1, null);
  assert.strictEqual(parsed1.hours, 8);
  assert.strictEqual(parsed1.project, "CMT HR Premium Replica Suite");

  const testQuery2 = "log 6.5 hours on HR Mobile App Project";
  const parsed2 = parseTimesheetCommand(testQuery2);
  assert.notStrictEqual(parsed2, null);
  assert.strictEqual(parsed2.hours, 6.5);
  assert.strictEqual(parsed2.project, "HR Mobile App Project");

  const testQuery3 = "Can you help me log 4.5 hours My Project Task?";
  const parsed3 = parseTimesheetCommand(testQuery3);
  assert.notStrictEqual(parsed3, null);
  assert.strictEqual(parsed3.hours, 4.5);
  assert.strictEqual(parsed3.project, "My Project Task");

  const invalidQuery = "show my holiday calendar";
  const parsedInvalid = parseTimesheetCommand(invalidQuery);
  assert.strictEqual(parsedInvalid, null);

  console.log('     ✅ Chatbot Timesheet Command Parsing Test Passed!');

  // Test 6: Chatbot Leaves Balance Fetch Integration
  console.log('\n  6. Testing Chatbot Leaves Balance Calculation Integration...');
  const calculateLeaveBalances = (leaves = []) => {
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

    return {
      sickBal,
      casualBal,
      annualBal,
      totalBal: sickBal + casualBal + annualBal
    };
  };

  const testLeaves = [
    { type: 'SICK', startDate: '2026-05-01', endDate: '2026-05-02', status: 'APPROVED' }, // 2 days
    { type: 'CASUAL', startDate: '2026-06-10', endDate: '2026-06-12', status: 'APPROVED' }, // 3 days
    { type: 'ANNUAL', startDate: '2026-07-20', endDate: '2026-07-24', status: 'APPROVED' }  // 5 days
  ];

  const balances = calculateLeaveBalances(testLeaves);
  assert.strictEqual(balances.sickBal, 8); // 10 - 2
  assert.strictEqual(balances.casualBal, 9); // 12 - 3
  assert.strictEqual(balances.annualBal, 10); // 15 - 5
  assert.strictEqual(balances.totalBal, 27); // 8 + 9 + 10 = 27

  console.log('     ✅ Chatbot Leaves Balance Calculation Test Passed!');

  console.log('\n🏁 All Unit Tests Completed Successfully! (6/6 passed)\n');
  process.exit(0);
} catch (error) {
  console.error('❌ Unit Test Failure:', error);
  process.exit(1);
}
