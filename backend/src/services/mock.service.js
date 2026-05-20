const fs = require('fs');
const path = require('path');

const MOCK_DATA_PATH = path.join(__dirname, '../../mock_db.json');

// Extensive initial mock data mimicking CMT HR environment
const initialData = {
  organizations: [
    {
      id: 'org_1',
      name: 'CloudMojo Tech',
      slug: 'cloudmojo',
      email: 'contact@cloudmojo.tech',
      status: 'APPROVED',
      subscription: { 
        status: 'ACTIVE', 
        planId: '2', 
        billingCycleStart: "2026-05-18T00:00:00.000Z",
        billingCycleEnd: "2026-06-18T00:00:00.000Z"
      },
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'org_2',
      name: 'Free Startup Co',
      slug: 'startup',
      email: 'contact@startup.com',
      status: 'APPROVED',
      subscription: { 
        status: 'ACTIVE', 
        planId: '1', 
        billingCycleStart: "2026-05-18T00:00:00.000Z",
        billingCycleEnd: "2026-06-18T00:00:00.000Z"
      },
      createdAt: "2026-05-14T09:00:00.000Z"
    }
  ],
  users: [
    // org_1: 15 Employees
    {
      id: 'user_admin',
      organizationId: 'org_1',
      email: 'admin@cloudmojo.tech',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ORG_ADMIN',
      designation: 'System Administrator',
      department: 'Management',
      employeeId: 'CMT-001',
      dateOfJoining: '2022-01-01T00:00:00.000Z',
      salary: 150000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_hr',
      organizationId: 'org_1',
      email: 'jane.hr@cloudmojo.tech',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'HR',
      designation: 'HR Lead',
      department: 'Human Resources',
      employeeId: 'CMT-002',
      dateOfJoining: '2023-11-01T00:00:00.000Z',
      salary: 80000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_manager1',
      organizationId: 'org_1',
      email: 'sarah.manager@cloudmojo.tech',
      password: 'password123',
      firstName: 'Sarah',
      lastName: 'Conner',
      role: 'MANAGER',
      designation: 'Engineering Manager',
      department: 'Technology',
      employeeId: 'CMT-003',
      dateOfJoining: '2023-01-15T00:00:00.000Z',
      salary: 120000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_manager2',
      organizationId: 'org_1',
      email: 'michael.manager@cloudmojo.tech',
      password: 'password123',
      firstName: 'Michael',
      lastName: 'Scott',
      role: 'MANAGER',
      designation: 'Sales Manager',
      department: 'Sales',
      employeeId: 'CMT-004',
      dateOfJoining: '2023-03-01T00:00:00.000Z',
      salary: 95000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_employee1',
      organizationId: 'org_1',
      managerId: 'user_manager1',
      email: 'john.dev@cloudmojo.tech',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: 'EMPLOYEE',
      designation: 'Senior Developer',
      department: 'Technology',
      employeeId: 'CMT-101',
      dateOfJoining: '2024-01-15T00:00:00.000Z',
      salary: 85000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_employee2',
      organizationId: 'org_1',
      managerId: 'user_manager1',
      email: 'david.dev@cloudmojo.tech',
      password: 'password123',
      firstName: 'David',
      lastName: 'Miller',
      role: 'EMPLOYEE',
      designation: 'Frontend Engineer',
      department: 'Technology',
      employeeId: 'CMT-102',
      dateOfJoining: '2024-05-10T00:00:00.000Z',
      salary: 70000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_employee3',
      organizationId: 'org_1',
      managerId: 'user_manager1',
      email: 'emily.qa@cloudmojo.tech',
      password: 'password123',
      firstName: 'Emily',
      lastName: 'Watson',
      role: 'EMPLOYEE',
      designation: 'QA Analyst',
      department: 'Technology',
      employeeId: 'CMT-103',
      dateOfJoining: '2024-06-01T00:00:00.000Z',
      salary: 65000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_employee4',
      organizationId: 'org_1',
      managerId: 'user_manager2',
      email: 'dwight.sales@cloudmojo.tech',
      password: 'password123',
      firstName: 'Dwight',
      lastName: 'Schrute',
      role: 'EMPLOYEE',
      designation: 'Assistant to the Regional Manager',
      department: 'Sales',
      employeeId: 'CMT-104',
      dateOfJoining: '2023-04-01T00:00:00.000Z',
      salary: 60000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_employee5',
      organizationId: 'org_1',
      managerId: 'user_manager2',
      email: 'jim.sales@cloudmojo.tech',
      password: 'password123',
      firstName: 'Jim',
      lastName: 'Halpert',
      role: 'EMPLOYEE',
      designation: 'Senior Sales Executive',
      department: 'Sales',
      employeeId: 'CMT-105',
      dateOfJoining: '2023-05-01T00:00:00.000Z',
      salary: 75000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_employee_6',
      organizationId: 'org_1',
      managerId: 'user_manager1',
      email: 'robert.dev@cloudmojo.tech',
      password: 'password123',
      firstName: 'Robert',
      lastName: 'Downey',
      role: 'EMPLOYEE',
      designation: 'Senior Devops Engineer',
      department: 'Technology',
      employeeId: 'CMT-106',
      dateOfJoining: '2024-02-15T00:00:00.000Z',
      salary: 95000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_employee_7',
      organizationId: 'org_1',
      managerId: 'user_manager1',
      email: 'scarlett.dev@cloudmojo.tech',
      password: 'password123',
      firstName: 'Scarlett',
      lastName: 'Johansson',
      role: 'EMPLOYEE',
      designation: 'Staff UX Researcher',
      department: 'Technology',
      employeeId: 'CMT-107',
      dateOfJoining: '2024-03-20T00:00:00.000Z',
      salary: 110000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_employee_8',
      organizationId: 'org_1',
      managerId: 'user_manager1',
      email: 'chris.dev@cloudmojo.tech',
      password: 'password123',
      firstName: 'Chris',
      lastName: 'Evans',
      role: 'EMPLOYEE',
      designation: 'Lead Security Engineer',
      department: 'Technology',
      employeeId: 'CMT-108',
      dateOfJoining: '2024-04-10T00:00:00.000Z',
      salary: 105000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_employee_9',
      organizationId: 'org_1',
      managerId: 'user_manager1',
      email: 'mark.dev@cloudmojo.tech',
      password: 'password123',
      firstName: 'Mark',
      lastName: 'Ruffalo',
      role: 'EMPLOYEE',
      designation: 'Infrastructure Engineer',
      department: 'Technology',
      employeeId: 'CMT-109',
      dateOfJoining: '2024-05-05T00:00:00.000Z',
      salary: 98000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_employee_10',
      organizationId: 'org_1',
      managerId: 'user_manager2',
      email: 'jeremy.dev@cloudmojo.tech',
      password: 'password123',
      firstName: 'Jeremy',
      lastName: 'Renner',
      role: 'EMPLOYEE',
      designation: 'Sales Representative',
      department: 'Sales',
      employeeId: 'CMT-110',
      dateOfJoining: '2024-06-01T00:00:00.000Z',
      salary: 58000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },
    {
      id: 'user_employee_11',
      organizationId: 'org_1',
      managerId: 'user_manager2',
      email: 'elizabeth.dev@cloudmojo.tech',
      password: 'password123',
      firstName: 'Elizabeth',
      lastName: 'Olsen',
      role: 'EMPLOYEE',
      designation: 'Client Success Manager',
      department: 'Sales',
      employeeId: 'CMT-111',
      dateOfJoining: '2024-07-01T00:00:00.000Z',
      salary: 62000,
      createdAt: "2026-05-13T11:43:00.000Z"
    },

    // org_2: 5 Employees
    {
      id: 'org2_admin',
      organizationId: 'org_2',
      email: 'admin@org2.com',
      password: 'password123',
      firstName: 'Alice',
      lastName: 'Green',
      role: 'ORG_ADMIN',
      designation: 'Founder & CEO',
      department: 'Management',
      employeeId: 'ORG2-001',
      dateOfJoining: '2025-01-01T00:00:00.000Z',
      salary: 100000,
      createdAt: "2026-05-14T09:00:00.000Z"
    },
    {
      id: 'org2_emp1',
      organizationId: 'org_2',
      managerId: 'org2_admin',
      email: 'emp1@org2.com',
      password: 'password123',
      firstName: 'Bob',
      lastName: 'Brown',
      role: 'EMPLOYEE',
      designation: 'Developer',
      department: 'Technology',
      employeeId: 'ORG2-101',
      dateOfJoining: '2025-02-01T00:00:00.000Z',
      salary: 50000,
      createdAt: "2026-05-14T09:00:00.000Z"
    },
    {
      id: 'org2_emp2',
      organizationId: 'org_2',
      managerId: 'org2_admin',
      email: 'emp2@org2.com',
      password: 'password123',
      firstName: 'Charlie',
      lastName: 'White',
      role: 'EMPLOYEE',
      designation: 'Designer',
      department: 'Technology',
      employeeId: 'ORG2-102',
      dateOfJoining: '2025-03-01T00:00:00.000Z',
      salary: 48000,
      createdAt: "2026-05-14T09:00:00.000Z"
    },
    {
      id: 'org2_emp3',
      organizationId: 'org_2',
      managerId: 'org2_admin',
      email: 'emp3@org2.com',
      password: 'password123',
      firstName: 'Daisy',
      lastName: 'Black',
      role: 'EMPLOYEE',
      designation: 'Marketing Executive',
      department: 'Marketing',
      employeeId: 'ORG2-103',
      dateOfJoining: '2025-04-01T00:00:00.000Z',
      salary: 42000,
      createdAt: "2026-05-14T09:00:00.000Z"
    },
    {
      id: 'org2_emp4',
      organizationId: 'org_2',
      managerId: 'org2_admin',
      email: 'emp4@org2.com',
      password: 'password123',
      firstName: 'Ethan',
      lastName: 'Grey',
      role: 'EMPLOYEE',
      designation: 'Support Engineer',
      department: 'Support',
      employeeId: 'ORG2-104',
      dateOfJoining: '2025-05-01T00:00:00.000Z',
      salary: 38000,
      createdAt: "2026-05-14T09:00:00.000Z"
    },

    // SUPER_ADMIN
    {
      id: 'user_super',
      email: 'superadmin@cmt.com',
      password: 'superadmin123',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      createdAt: "2026-05-13T11:43:00.000Z"
    }
  ],
  plans: [
    { 
      id: '1', 
      name: 'Free', 
      price: { monthly: 0 }, 
      maxEmployees: 10, 
      maxStorage: '100 MB', 
      features: ['basic-hr', 'attendance', 'reviews-1'] 
    },
    { 
      id: '2', 
      name: 'Pro', 
      price: { monthly: 49 }, 
      maxEmployees: 100, 
      maxStorage: '5 GB', 
      features: ['basic-hr', 'attendance', 'reviews', 'performance', 'api-access', 'custom-form-builder', 'advanced-reporting'] 
    },
    { 
      id: '3', 
      name: 'Enterprise', 
      price: { monthly: 'Custom' }, 
      maxEmployees: 999999, 
      maxStorage: '50 GB', 
      features: ['basic-hr', 'attendance', 'reviews', 'performance', 'api-access', 'custom-form-builder', 'advanced-reporting', 'sso', 'priority-support'] 
    }
  ],
  attendances: [
    {
      id: 'att_1',
      userId: 'user_employee1',
      organizationId: 'org_1',
      checkIn: '2026-05-18T09:00:00.000Z',
      checkOut: '2026-05-18T18:00:00.000Z',
      location: '12.9716, 77.5946 (Office)',
      status: 'PRESENT',
      date: '2026-05-18T00:00:00.000Z'
    },
    {
      id: 'att_2',
      userId: 'user_employee2',
      organizationId: 'org_1',
      checkIn: '2026-05-18T09:45:00.000Z',
      checkOut: '2026-05-18T18:15:00.000Z',
      location: 'Office',
      status: 'LATE',
      date: '2026-05-18T00:00:00.000Z'
    }
  ],
  leaves: [
    {
      id: 'leave_1',
      userId: 'user_employee1',
      organizationId: 'org_1',
      type: 'SICK',
      startDate: '2026-05-10T00:00:00.000Z',
      endDate: '2026-05-11T00:00:00.000Z',
      reason: 'Fever and flu symptoms',
      status: 'APPROVED',
      appliedAt: '2026-05-09T10:00:00.000Z'
    },
    {
      id: 'leave_2',
      userId: 'user_employee2',
      organizationId: 'org_1',
      type: 'CASUAL',
      startDate: '2026-05-20T00:00:00.000Z',
      endDate: '2026-05-22T00:00:00.000Z',
      reason: 'Personal family work',
      status: 'PENDING',
      appliedAt: '2026-05-15T14:30:00.000Z'
    }
  ],
  configs: [
    {
      id: 'cfg_1',
      organizationId: 'org_1',
      windowStart: '09:00 AM',
      windowEnd: '06:00 PM',
      requiredHours: 9,
      minPresentMinutes: 480
    }
  ],
  announcements: [
    {
      id: 'ann_1',
      title: 'Updated Office Policy',
      content: 'We have updated our hybrid work policy. Mandatory office presence is now 3 days a week starting next month. Please sync with your reporting managers.',
      type: 'POLICY',
      authorName: 'Jane Smith (HR)',
      authorId: 'user_hr',
      organizationId: 'org_1',
      likes: ['user_employee1', 'user_employee2'],
      comments: [
        { userId: 'user_employee1', userName: 'John Doe', comment: 'Got it, thanks for the update.', createdAt: '2026-05-15T09:00:00.000Z' }
      ],
      createdAt: '2026-05-15T08:30:00.000Z'
    },
    {
      id: 'ann_2',
      title: 'Congratulations Team John dev!',
      content: 'Amazing work on delivering the SaaS platform before the deadline! Everyone is invited to the lunch buffet at the Orchid Ballroom this Friday.',
      type: 'EVENT',
      authorName: 'Sarah Conner',
      authorId: 'user_manager1',
      organizationId: 'org_1',
      likes: ['user_employee1', 'user_employee2', 'user_employee3'],
      comments: [],
      createdAt: '2026-05-16T12:00:00.000Z'
    }
  ],
  tickets: [
    {
      id: 'tkt_1',
      title: 'MacBook Pro screen glitching',
      description: 'The bottom half of the secondary monitor shows pink stripes when plugged into the thunderbolt port.',
      category: 'IT',
      priority: 'HIGH',
      status: 'OPEN',
      userId: 'user_employee1',
      organizationId: 'org_1',
      comments: [
        { authorId: 'user_hr', authorName: 'Jane HR', text: 'Hi John, IT support is looking into replacement cables. Standby.', createdAt: '2026-05-17T11:00:00.000Z' }
      ],
      createdAt: '2026-05-17T10:00:00.000Z',
      updatedAt: '2026-05-17T11:00:00.000Z'
    }
  ],
  goals: [
    {
      id: 'goal_1',
      userId: 'user_employee1',
      organizationId: 'org_1',
      title: 'Redesign Core Auth Module',
      description: 'Implement JWT refresh tokens, sanitization and MFA simulation.',
      targetValue: 100,
      currentValue: 80,
      unit: '%',
      startDate: '2026-05-01T00:00:00.000Z',
      endDate: '2026-05-31T00:00:00.000Z',
      status: 'IN_PROGRESS',
      createdAt: '2026-05-01T09:00:00.000Z',
      updatedAt: '2026-05-18T10:00:00.000Z'
    },
    {
      id: 'goal_2',
      userId: 'user_employee2',
      organizationId: 'org_1',
      title: 'Improve Lighthouse Score',
      description: 'Bring the landing page performance score above 90.',
      targetValue: 90,
      currentValue: 65,
      unit: 'points',
      startDate: '2026-05-10T00:00:00.000Z',
      endDate: '2026-06-10T00:00:00.000Z',
      status: 'PENDING',
      createdAt: '2026-05-10T10:00:00.000Z',
      updatedAt: '2026-05-10T10:00:00.000Z'
    }
  ],
  reviews: [
    {
      id: 'rev_1',
      revieweeId: 'user_employee1',
      reviewerId: 'user_manager1',
      cycleName: 'Q2 2026 Appraisal',
      rating: 4,
      comments: 'John has shown outstanding engineering output, especially leading the SaaS migrations.',
      selfReview: 'I accomplished all my engineering OKRs and resolved 15 support tickets.',
      status: 'FINISHED',
      organizationId: 'org_1',
      createdAt: '2026-05-15T00:00:00.000Z',
      updatedAt: '2026-05-17T00:00:00.000Z'
    }
  ],
  jobs: [
    {
      id: 'job_1',
      title: 'Full Stack Engineer (Node/React)',
      description: 'Looking for a Senior Developer to take ownership of high-availability features in our core HRMS platform.',
      department: 'Technology',
      requirements: '3+ years experience with React, Node Express, and Postgres.',
      salaryRange: '$80,000 - $110,000',
      status: 'OPEN',
      organizationId: 'org_1',
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z'
    }
  ],
  applicants: [
    {
      id: 'app_1',
      jobId: 'job_1',
      name: 'Alan Turing',
      email: 'alan@turingcode.org',
      phone: '+44 987654321',
      resumeUrl: '/mock/docs/alan_turing_resume.pdf',
      status: 'INTERVIEWED',
      onboardingTasks: [
        { id: 'task_1', task: 'Issue Laptop & Hardware credentials', status: 'PENDING', assignee: 'IT' },
        { id: 'task_2', task: 'HR Onboarding Paperwork and Offer Letter', status: 'DONE', assignee: 'HR' },
        { id: 'task_3', task: 'Allocate Workspace desk and card access', status: 'PENDING', assignee: 'FACILITIES' }
      ],
      offboardingTasks: [],
      organizationId: 'org_1',
      createdAt: '2026-05-05T10:00:00.000Z',
      updatedAt: '2026-05-18T10:00:00.000Z'
    }
  ],
  documents: [
    {
      id: 'doc_1',
      name: 'John_Doe_Offer_Letter.pdf',
      url: '/mock/docs/john_doe_offer_letter.pdf',
      type: 'OFFER_LETTER',
      userId: 'user_employee1',
      organizationId: 'org_1',
      createdAt: '2024-01-15T09:00:00.000Z'
    }
  ],
  timesheets: [
    {
      id: 'ts_1',
      userId: 'user_employee1',
      project: 'CMT SaaS Mobile App',
      date: '2026-05-18T00:00:00.000Z',
      hoursLogged: 7.5,
      description: 'Implemented the executive dashboard frontend components and adjusted HSL color palette.',
      status: 'APPROVED',
      organizationId: 'org_1',
      createdAt: '2026-05-18T17:30:00.000Z'
    }
  ],
  customFields: [
    {
      id: 'cf_1',
      fieldName: 'tShirtSize',
      fieldLabel: 'T-Shirt Size',
      fieldType: 'SELECT',
      options: 'S,M,L,XL,XXL',
      isRequired: false,
      organizationId: 'org_1',
      createdAt: '2026-05-14T09:00:00.000Z'
    }
  ],
  auditLogs: [],
  invitations: []
};

const getDb = () => {
  try {
    if (!fs.existsSync(MOCK_DATA_PATH)) {
      fs.writeFileSync(MOCK_DATA_PATH, JSON.stringify(initialData, null, 2));
    }
    const content = fs.readFileSync(MOCK_DATA_PATH, 'utf-8');
    if (!content || content.trim() === '') return initialData;
    let data = JSON.parse(content);
    
    // Safety check - make sure essential tables exist
    let dirty = false;
    const collections = [
      'organizations', 'users', 'plans', 'attendances', 'leaves', 'configs',
      'announcements', 'tickets', 'goals', 'reviews', 'jobs', 'applicants',
      'documents', 'timesheets', 'customFields', 'auditLogs', 'invitations'
    ];
    for (const coll of collections) {
      if (!data[coll]) {
        data[coll] = initialData[coll] || [];
        dirty = true;
      }
    }
    // Make sure we have our mock data seeded properly if users got wiped
    if (!data.users || data.users.length < 8) {
      data.users = initialData.users;
      dirty = true;
    }
    if (dirty) {
      saveDb(data);
    }
    return data;
  } catch (error) {
    console.error('❌ Mock DB Error:', error.message);
    return initialData;
  }
};

const saveDb = (data) => {
  fs.writeFileSync(MOCK_DATA_PATH, JSON.stringify(data, null, 2));
};

const mockDb = {
  find: (collection, query = {}) => {
    const data = getDb();
    const items = data[collection] || [];
    return items.filter(item => {
      return Object.keys(query).every(key => {
        if (query[key] === undefined) return true;
        return item[key] === query[key];
      });
    });
  },
  findOne: (collection, query) => {
    const items = mockDb.find(collection, query);
    return items[0] || null;
  },
  create: (collection, item) => {
    const data = getDb();
    const newItem = { ...item, id: Date.now().toString(), createdAt: new Date().toISOString() };
    if (!data[collection]) data[collection] = [];
    data[collection].push(newItem);
    saveDb(data);
    return newItem;
  },
  update: (collection, id, updates) => {
    console.log(`📝 Updating ${collection}:${id}`, updates);
    const data = getDb();
    if (!data[collection]) return null;
    const index = data[collection].findIndex(item => item.id === id);
    if (index !== -1) {
      // Filter out undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );
      data[collection][index] = { ...data[collection][index], ...cleanUpdates };
      saveDb(data);
      return data[collection][index];
    }
    return null;
  },
  delete: (collection, id) => {
    console.log(`🗑️ Deleting ${collection}:${id}`);
    const data = getDb();
    if (!data[collection]) return false;
    const index = data[collection].findIndex(item => item.id === id);
    if (index !== -1) {
      data[collection].splice(index, 1);
      saveDb(data);
      return true;
    }
    return false;
  },
  count: (collection, query) => {
    return mockDb.find(collection, query).length;
  }
};

module.exports = mockDb;
