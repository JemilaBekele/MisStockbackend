const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const prisma = require('./prisma');

// Get Branch by ID
const getBranchById = async (id) => {
  const branch = await prisma.branch.findUnique({
    where: { id },
    include: {
      Shop: true,
      Store: true,
      User: true,
    },
  });
  return branch;
};

// Get Branch by Name
const getBranchByName = async (name) => {
  const branch = await prisma.branch.findFirst({
    where: { name },
  });
  return branch;
};

// Get all Branches
const getAllBranches = async () => {
  const branches = await prisma.branch.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      Shop: true,
      Store: true,
      User: true,
    },
  });

  return {
    branches,
    count: branches.length,
  };
};

// Create Branch
const createBranch = async (branchBody) => {
  // Check if branch with same name already exists
  if (await getBranchByName(branchBody.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Branch name already taken');
  }

  const branch = await prisma.branch.create({
    data: branchBody,
  });
  return branch;
};

// Update Branch
const updateBranch = async (id, updateBody) => {
  const existingBranch = await getBranchById(id);
  if (!existingBranch) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Branch not found');
  }

  // Check if name is being updated to an existing branch name
  if (updateBody.name && updateBody.name !== existingBranch.name) {
    if (await getBranchByName(updateBody.name)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Branch name already taken');
    }
  }

  const updatedBranch = await prisma.branch.update({
    where: { id },
    data: updateBody,
    include: {
      Shop: true,
      Store: true,
      User: true,
    },
  });

  return updatedBranch;
};

// Delete Branch
const deleteBranch = async (id) => {
  const existingBranch = await getBranchById(id);
  if (!existingBranch) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Branch not found');
  }

  await prisma.branch.delete({
    where: { id },
  });

  return { message: 'Branch deleted successfully' };
};

module.exports = {
  getBranchById,
  getBranchByName,
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch,
};
