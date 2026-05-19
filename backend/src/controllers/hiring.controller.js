const { Job, Applicant, Separation, User } = require('../services/db.service');
const mongoose = require('mongoose');

// ==========================================
//               JOB POSTINGS
// ==========================================

exports.createJob = async (req, res) => {
  try {
    const { title, description, department, requirements, salaryRange } = req.body;
    const organizationId = req.organizationId;

    const job = new Job({
      title,
      description,
      department,
      requirements: Array.isArray(requirements) ? requirements : [requirements].filter(Boolean),
      status: 'OPEN',
      organizationId
    });
    await job.save();

    res.status(201).json({ message: 'Job created successfully', job: { ...job.toObject(), id: job._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job', error: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const jobs = await Job.find({ organizationId }).sort({ createdAt: -1 }).lean();

    res.json(jobs.map(j => ({ ...j, id: j._id.toString() })));
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

    const onboardingTasks = [
      { id: 't1', title: 'Issue Laptop & Hardware credentials', status: 'PENDING' },
      { id: 't2', title: 'HR Paperwork & Signature', status: 'PENDING' },
      { id: 't3', title: 'Desk & Security ID Access Card allocation', status: 'PENDING' }
    ];

    const applicant = new Applicant({
      jobId: jobId && mongoose.isValidObjectId(jobId) ? jobId : undefined,
      name,
      email,
      phone,
      resumeUrl,
      status: 'APPLIED',
      onboardingTasks,
      organizationId
    });
    await applicant.save();

    res.status(201).json({ message: 'Applied successfully', applicant: { ...applicant.toObject(), id: applicant._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Application failed', error: error.message });
  }
};

exports.getApplicants = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const applicants = await Applicant.find({ organizationId }).populate('jobId').sort({ createdAt: -1 }).lean();

    const normalized = applicants.map(a => {
      const job = a.jobId || { title: 'General Application', department: 'HR' };
      return {
        ...a,
        id: a._id.toString(),
        job: { ...job, id: job._id?.toString() }
      };
    });

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applicants', error: error.message });
  }
};

exports.updateApplicantStatus = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(applicantId)) {
      return res.status(400).json({ message: 'Invalid applicant ID' });
    }

    const applicant = await Applicant.findByIdAndUpdate(
      applicantId,
      { $set: { status } },
      { new: true }
    ).lean();

    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    res.json({ message: 'Status updated successfully', applicant: { ...applicant, id: applicant._id.toString() } });
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

    if (!mongoose.isValidObjectId(applicantId)) {
      return res.status(400).json({ message: 'Invalid applicant ID' });
    }

    const applicant = await Applicant.findById(applicantId);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    const tasks = applicant.onboardingTasks || [];
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index].status = status === 'DONE' ? 'DONE' : 'PENDING';
    }

    applicant.onboardingTasks = tasks;
    await applicant.save();

    res.json({ message: 'Onboarding task updated successfully', applicant: { ...applicant.toObject(), id: applicant._id.toString() } });
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

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Valid employee ID is required.' });
    }

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: 'Employee not found' });

    const offboardingTasks = [
      { id: 'o1', title: 'Revoke Email & SaaS accesses', status: 'PENDING' },
      { id: 'o2', title: 'Conduct Exit Interview Form', status: 'PENDING' },
      { id: 'o3', title: 'Handover Asset & Office Keycards', status: 'PENDING' }
    ];

    const separation = new Separation({
      userId,
      reason,
      lastWorkingDay: lastWorkingDay ? new Date(lastWorkingDay) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
      offboardingTasks,
      organizationId
    });
    await separation.save();

    res.status(201).json({ message: 'Separation request raised successfully', exitRequest: { ...separation.toObject(), id: separation._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to raise exit request', error: error.message });
  }
};

exports.getSeparations = async (req, res) => {
  try {
    const organizationId = req.organizationId;
    const exits = await Separation.find({ organizationId }).populate('userId').sort({ createdAt: -1 }).lean();

    const normalized = exits.map(e => {
      const user = e.userId || { firstName: 'Unknown', lastName: '' };
      return {
        ...e,
        id: e._id.toString(),
        user: { ...user, id: user._id?.toString() }
      };
    });

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch separations', error: error.message });
  }
};

exports.updateExitStatus = async (req, res) => {
  try {
    const { exitId } = req.params;
    const { status } = req.body; // status: APPROVED, REJECTED, COMPLETED

    if (!mongoose.isValidObjectId(exitId)) {
      return res.status(400).json({ message: 'Invalid exit ID' });
    }

    const separation = await Separation.findByIdAndUpdate(
      exitId,
      { $set: { status } },
      { new: true }
    ).lean();

    if (!separation) return res.status(404).json({ message: 'Exit workflow not found' });

    res.json({ message: 'Exit status updated successfully', exit: { ...separation, id: separation._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update exit status', error: error.message });
  }
};

exports.updateExitTask = async (req, res) => {
  try {
    const { exitId } = req.params;
    const { taskId, status } = req.body; // status: PENDING, DONE

    if (!mongoose.isValidObjectId(exitId)) {
      return res.status(400).json({ message: 'Invalid exit ID' });
    }

    const separation = await Separation.findById(exitId);
    if (!separation) return res.status(404).json({ message: 'Exit workflow not found' });

    const tasks = separation.offboardingTasks || [];
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index].status = status === 'DONE' ? 'DONE' : 'PENDING';
    }

    separation.offboardingTasks = tasks;
    await separation.save();

    res.json({ message: 'Exit task updated successfully', exit: { ...separation.toObject(), id: separation._id.toString() } });
  } catch (error) {
    res.status(500).json({ message: 'Exit task update failed', error: error.message });
  }
};
