const prisma = require('../services/prisma.service');
const mockDb = require('../services/mock.service');

// ==========================================
//               JOB POSTINGS
// ==========================================

exports.createJob = async (req, res) => {
  try {
    const { title, description, department, requirements, salaryRange } = req.body;
    const organizationId = req.organizationId;

    try {
      const job = await prisma.job.create({
        data: {
          title,
          description,
          department,
          requirements,
          salaryRange,
          status: 'OPEN',
          organizationId
        }
      });
      return res.status(201).json({ message: 'Job created (Postgres)', job });
    } catch (dbError) {
      console.warn('⚠️ Postgres Job Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const job = mockDb.create('jobs', {
      title,
      description,
      department,
      requirements,
      salaryRange,
      status: 'OPEN',
      organizationId
    });
    res.status(201).json({ message: 'Job created (Mock)', job });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job', error: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const organizationId = req.organizationId;

    try {
      const jobs = await prisma.job.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(jobs);
    } catch (dbError) {
      console.warn('⚠️ Postgres Get Jobs Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const jobs = mockDb.find('jobs', { organizationId });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: error.message });
  }
};

// ==========================================
//           APPLICANT TRACKING
// ==========================================

exports.applyJob = async (req, res) => {
  try {
    const { jobId, name, email, phone, resumeUrl } = req.body;
    const organizationId = req.organizationId;

    try {
      const applicant = await prisma.applicant.create({
        data: {
          jobId,
          name,
          email,
          phone,
          resumeUrl,
          status: 'NEW',
          organizationId
        }
      });
      return res.status(201).json({ message: 'Applied successfully (Postgres)', applicant });
    } catch (dbError) {
      console.warn('⚠️ Postgres Application Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const applicant = mockDb.create('applicants', {
      jobId,
      name,
      email,
      phone,
      resumeUrl,
      status: 'NEW',
      onboardingTasks: [
        { id: 't1', task: 'Issue Laptop & Hardware credentials', status: 'PENDING', assignee: 'IT' },
        { id: 't2', task: 'HR Paperwork & Signature', status: 'PENDING', assignee: 'HR' },
        { id: 't3', task: 'Desk & Security ID Access Card allocation', status: 'PENDING', assignee: 'FACILITIES' }
      ],
      offboardingTasks: [
        { id: 'o1', task: 'Revoke Email & SaaS accesses', status: 'PENDING', assignee: 'IT' },
        { id: 'o2', task: 'Conduct Exit Interview Form', status: 'PENDING', assignee: 'HR' },
        { id: 'o3', task: 'Handover Asset & Office Keycards', status: 'PENDING', assignee: 'FACILITIES' }
      ],
      organizationId
    });
    res.status(201).json({ message: 'Applied successfully (Mock)', applicant });
  } catch (error) {
    res.status(500).json({ message: 'Application failed', error: error.message });
  }
};

exports.getApplicants = async (req, res) => {
  try {
    const organizationId = req.organizationId;

    try {
      const applicants = await prisma.applicant.findMany({
        where: { organizationId },
        include: { job: { select: { title: true, department: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(applicants);
    } catch (dbError) {
      console.warn('⚠️ Postgres Get Applicants Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const applicants = mockDb.find('applicants', { organizationId });
    const enriched = applicants.map(a => {
      const job = mockDb.findOne('jobs', { id: a.jobId }) || { title: 'General Application', department: 'HR' };
      return { ...a, job };
    });
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applicants', error: error.message });
  }
};

exports.updateApplicantStatus = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const { status } = req.body;

    try {
      const applicant = await prisma.applicant.update({
        where: { id: applicantId },
        data: { status }
      });
      return res.json({ message: 'Status updated (Postgres)', applicant });
    } catch (dbError) {
      console.warn('⚠️ Postgres Applicant Update Error, using Mock:', dbError.message);
    }

    // Mock Fallback
    const applicant = mockDb.update('applicants', applicantId, { status });
    res.json({ message: 'Status updated (Mock)', applicant });
  } catch (error) {
    res.status(500).json({ message: 'Status update failed', error: error.message });
  }
};

// ==========================================
//          ONBOARDING CHECKLISTS
// ==========================================

exports.updateOnboardingTask = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const { taskId, status } = req.body; // status: 'PENDING' or 'DONE'

    // Mock Fallback as default for Json task lists, or Prisma update
    const applicant = mockDb.findOne('applicants', { id: applicantId });
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    const tasks = applicant.onboardingTasks || [];
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index].status = status;
    }

    const updated = mockDb.update('applicants', applicantId, { onboardingTasks: tasks });
    res.json({ message: 'Onboarding task updated', applicant: updated });
  } catch (error) {
    res.status(500).json({ message: 'Task update failed', error: error.message });
  }
};

// ==========================================
//          OFFBOARDING WORKFLOWS
// ==========================================

exports.requestSeparation = async (req, res) => {
  try {
    const { userId, reason, lastWorkingDay } = req.body;
    const organizationId = req.organizationId;

    // Create an applicant placeholder representing offboarding, or mark in employee record
    // In this simplified Zoho HR workflow, we can register an offboarding workflow directly for the user.
    // We will save this exits/separations request in mock DB as an applicant status or user exit metadata
    const user = mockDb.findOne('users', { id: userId });
    if (!user) return res.status(404).json({ message: 'Employee not found' });

    const offboardingTasks = [
      { id: 'o1', task: 'Revoke Email & SaaS accesses', status: 'PENDING', assignee: 'IT' },
      { id: 'o2', task: 'Conduct Exit Interview Form', status: 'PENDING', assignee: 'HR' },
      { id: 'o3', task: 'Handover Asset & Office Keycards', status: 'PENDING', assignee: 'FACILITIES' }
    ];

    const exitRequest = mockDb.create('exits', {
      userId,
      reason,
      lastWorkingDay,
      status: 'PENDING',
      offboardingTasks,
      organizationId
    });

    res.status(201).json({ message: 'Separation request raised', exitRequest });
  } catch (error) {
    res.status(500).json({ message: 'Failed to raise exit request', error: error.message });
  }
};

exports.getSeparations = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const exits = mockDb.find('exits', { organizationId }) || [];
    
    // Enrich with user profile details
    const enriched = exits.map(e => {
      const user = mockDb.findOne('users', { id: e.userId }) || { firstName: 'Unknown', lastName: '' };
      return { ...e, user };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch separations', error: error.message });
  }
};

exports.updateExitStatus = async (req, res) => {
  try {
    const { exitId } = req.params;
    const { status } = req.body; // status: APPROVED, REJECTED, COMPLETED

    const exit = mockDb.update('exits', exitId, { status });
    res.json({ message: 'Exit status updated', exit });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update exit status', error: error.message });
  }
};

exports.updateExitTask = async (req, res) => {
  try {
    const { exitId } = req.params;
    const { taskId, status } = req.body; // status: PENDING, DONE

    const exit = mockDb.findOne('exits', { id: exitId });
    if (!exit) return res.status(404).json({ message: 'Exit workflow not found' });

    const tasks = exit.offboardingTasks || [];
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index].status = status;
    }

    const updated = mockDb.update('exits', exitId, { offboardingTasks: tasks });
    res.json({ message: 'Exit task updated', exit: updated });
  } catch (error) {
    res.status(500).json({ message: 'Exit task update failed', error: error.message });
  }
};
