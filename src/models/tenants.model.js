const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const toJson = require('@meanie/mongoose-to-json');

const tenantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    adress: {
        type: String,
        trim: true,
      },
    note: {
        type: String,
        trim: true,
      },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },    
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      private: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            'Password should contain atleast one uppercase and lowercase letter, number and special character',
          );
        }
      },
    },
  },
  {
    timestamps: true,
  },
);

tenantSchema.statics.isEmailTaken = async function (email) {
  const tenant = await this.findOne({ email });
  return !!tenant;
};

tenantSchema.index({ email: 1 });

tenantSchema.pre('save', async function (next) {
  const tenant = this;
  if (tenant.isModified('password')) {
    tenant.password = await bcrypt.hash(tenant.password, 8);
  }
  next();
});

tenantSchema.methods.isPasswordMatch = async function (password) {
  const tenant = this;
  const isPasswordCorrect = await bcrypt.compare(password, tenant.password);
  return isPasswordCorrect;
};

tenantSchema.plugin(toJson);

const Tenant = mongoose.model('Tenant', tenantSchema);

module.exports = Tenant;
