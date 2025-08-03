import * as yup from 'yup'

// User registration schema
export const registerSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
})

// User login schema
export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required'),
  rememberMe: yup
    .boolean()
    .default(false),
})

// Project creation schema
export const projectSchema = yup.object({
  name: yup
    .string()
    .required('Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  category: yup
    .string()
    .required('Category is required'),
  startDate: yup
    .date()
    .required('Start date is required')
    .min(new Date(), 'Start date cannot be in the past'),
  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  budget: yup
    .number()
    .required('Budget is required')
    .positive('Budget must be positive')
    .max(1000000, 'Budget cannot exceed $1,000,000'),
  teamMembers: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one team member is required'),
})

// User profile update schema
export const profileSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  bio: yup
    .string()
    .max(200, 'Bio must be less than 200 characters'),
  phone: yup
    .string()
    .matches(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'),
  location: yup
    .string()
    .max(100, 'Location must be less than 100 characters'),
})

// Settings schema
export const settingsSchema = yup.object({
  theme: yup
    .string()
    .oneOf(['light', 'dark', 'system'], 'Invalid theme selection'),
  notifications: yup.object({
    email: yup.boolean().default(true),
    push: yup.boolean().default(true),
    sms: yup.boolean().default(false),
  }),
  privacy: yup.object({
    profileVisibility: yup
      .string()
      .oneOf(['public', 'private', 'friends'], 'Invalid visibility option'),
    showEmail: yup.boolean().default(false),
    showPhone: yup.boolean().default(false),
  }),
})

// Contact form schema
export const contactSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  subject: yup
    .string()
    .required('Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  message: yup
    .string()
    .required('Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
})

// Search schema
export const searchSchema = yup.object({
  query: yup
    .string()
    .required('Search query is required')
    .min(2, 'Search query must be at least 2 characters'),
  filters: yup.object({
    category: yup.string().optional(),
    dateRange: yup.string().optional(),
    status: yup.string().optional(),
  }),
})

// Export types
export type RegisterFormData = yup.InferType<typeof registerSchema>
export type LoginFormData = yup.InferType<typeof loginSchema>
export type ProjectFormData = yup.InferType<typeof projectSchema>
export type ProfileFormData = yup.InferType<typeof profileSchema>
export type SettingsFormData = yup.InferType<typeof settingsSchema>
export type ContactFormData = yup.InferType<typeof contactSchema>
export type SearchFormData = yup.InferType<typeof searchSchema> 