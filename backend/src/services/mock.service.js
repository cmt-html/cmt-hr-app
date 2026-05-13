const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../../mock_db.json');

// Initial Mock Data
const initialData = {
  organizations: [
    {
      id: 'org_1',
      name: 'CloudMojo Tech',
      slug: 'cloudmojo',
      email: 'contact@cloudmojo.tech',
      status: 'APPROVED',
      subscription: { status: 'ACTIVE', planId: '3' },
      createdAt: new Date()
    }
  ],
  users: [
    {
      id: 'user_admin',
      organizationId: 'org_1',
      email: 'admin@cloudmojo.tech',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ORG_ADMIN',
      createdAt: new Date()
    },
    {
      id: 'user_hr',
      organizationId: 'org_1',
      email: 'jane.hr@cloudmojo.tech',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'HR',
      role: 'HR',
      createdAt: new Date()
    },
    {
      id: 'user_manager',
      organizationId: 'org_1',
      email: 'sarah.manager@cloudmojo.tech',
      password: 'password123',
      firstName: 'Sarah',
      lastName: 'Manager',
      role: 'MANAGER',
      createdAt: new Date()
    },
    {
      id: 'user_employee',
      organizationId: 'org_1',
      email: 'john.dev@cloudmojo.tech',
      password: 'password123',
      firstName: 'John',
      lastName: 'Employee',
      role: 'EMPLOYEE',
      createdAt: new Date()
    },
    {
      id: 'user_super',
      email: 'superadmin@cmt.com',
      password: 'superadmin123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      createdAt: new Date()
    }
  ],
  plans: [
    { id: '1', name: 'Starter', price: { monthly: 49 }, features: ['attendance'] },
    { id: '2', name: 'Pro', price: { monthly: 99 }, features: ['attendance', 'payroll'] },
    { id: '3', name: 'Enterprise', price: { monthly: 249 }, features: ['attendance', 'payroll', 'ai-assistant'] }
  ],
  auditLogs: []
};

const getDb = () => {
  if (!fs.existsSync(MOCK_DATA_PATH)) {
    fs.writeFileSync(MOCK_DATA_PATH, JSON.stringify(initialData, null, 2));
  }
  let data = JSON.parse(fs.readFileSync(MOCK_DATA_PATH));
  
  // If the file is missing users or out of date, populate it now
  if (!data.users || data.users.length < 5) {
    data = initialData;
    saveDb(data);
  }
  return data;
};

const saveDb = (data) => {
  fs.writeFileSync(MOCK_DATA_PATH, JSON.stringify(data, null, 2));
};

const mockDb = {
  find: (collection, query = {}) => {
    const data = getDb();
    const items = data[collection] || [];
    return items.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  },
  findOne: (collection, query) => {
    const items = mockDb.find(collection, query);
    return items[0] || null;
  },
  create: (collection, item) => {
    const data = getDb();
    const newItem = { ...item, id: Date.now().toString(), createdAt: new Date() };
    if (!data[collection]) data[collection] = [];
    data[collection].push(newItem);
    saveDb(data);
    return newItem;
  },
  update: (collection, id, updates) => {
    const data = getDb();
    if (!data[collection]) return null;
    const index = data[collection].findIndex(item => item.id === id);
    if (index !== -1) {
      // Filter out undefined values to avoid overwriting with null
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );
      data[collection][index] = { ...data[collection][index], ...cleanUpdates };
      saveDb(data);
      return data[collection][index];
    }
    return null;
  },
  count: (collection, query) => {
    return mockDb.find(collection, query).length;
  }
};

module.exports = mockDb;
