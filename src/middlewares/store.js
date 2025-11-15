module.exports = {
  DEPARTMENT: {
    CREATE: {
      name: 'CREATE_DEPARTMENT',
      description: 'Create new departments',
    },
    VIEW: {
      name: 'VIEW_DEPARTMENT',
      description: 'View a specific department by ID',
    },
    VIEW_ALL: {
      name: 'VIEW_DEPARTMENTS',
      description: 'View all departments',
    },
    UPDATE: {
      name: 'UPDATE_DEPARTMENT',
      description: 'Update department details',
    },
    DELETE: {
      name: 'DELETE_DEPARTMENT',
      description: 'Delete a department',
    },
    VIEW_HIERARCHY: {
      name: 'VIEW_DEPARTMENT_HIERARCHY',
      description: 'View the department hierarchy tree',
    },
    ASSIGN_USER: {
      name: 'ASSIGN_USER_TO_DEPARTMENT',
      description: 'Assign a user to a department with a role',
    },
    VIEW_USER_HIERARCHY: {
      name: 'VIEW_USER_HIERARCHY_INFO',
      description: 'View hierarchy info for a user',
    },
    VIEW_Own: {
      name: 'VIEW_DEPARTMENT',
      description: 'View a specific user department ',
    },
  },

  DEPARTMENT_UNIT: {
    CREATE: {
      name: 'CREATE_DEPARTMENT_UNIT',
      description: 'Create a department unit',
    },
    VIEW: {
      name: 'VIEW_DEPARTMENT_UNIT',
      description: 'View a department unit by ID',
    },
    UPDATE: {
      name: 'UPDATE_DEPARTMENT_UNIT',
      description: 'Update a department unit',
    },
    DELETE: {
      name: 'DELETE_DEPARTMENT_UNIT',
      description: 'Delete a department unit',
    },
  },

  MANAGER_MEMBERSHIP: {
    CREATE_BULK: {
      name: 'CREATE_MANAGER_MEMBERSHIPS_BULK',
      description: 'Create multiple manager memberships',
    },
    UPDATE_BULK: {
      name: 'UPDATE_MANAGER_MEMBERSHIPS_BULK',
      description: 'Update multiple manager memberships',
    },
    VIEW: {
      name: 'VIEW_MANAGER_MEMBERSHIP',
      description: 'View a manager membership by ID',
    },
    DELETE: {
      name: 'DELETE_MANAGER_MEMBERSHIP',
      description: 'Delete a manager membership',
    },
  },
};
