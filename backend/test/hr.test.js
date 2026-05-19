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
console.log('🧪 Starting Zoho HR Backend Unit Tests...');

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

  console.log('\n🏁 All Unit Tests Completed Successfully! (3/3 passed)\n');
  process.exit(0);
} catch (error) {
  console.error('❌ Unit Test Failure:', error);
  process.exit(1);
}
