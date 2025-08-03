'use client'

import * as React from 'react'
import { useForm, UseFormReturn, FieldValues, Path, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { showValidationError } from '@/lib/utils/toast'

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  required?: boolean
  disabled?: boolean
  className?: string
  form: UseFormReturn<T>
}

interface FormTextareaProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  rows?: number
  required?: boolean
  disabled?: boolean
  className?: string
  form: UseFormReturn<T>
}

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  placeholder?: string
  options: { value: string; label: string }[]
  required?: boolean
  disabled?: boolean
  className?: string
  form: UseFormReturn<T>
}

interface FormCheckboxProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
  form: UseFormReturn<T>
}

interface FormProps<T extends FieldValues> {
  schema: yup.ObjectSchema<any>
  defaultValues?: Partial<T>
  onSubmit: (data: T) => void | Promise<void>
  children: React.ReactNode
  className?: string
  submitText?: string
  loading?: boolean
}

// Form Field Component
export function FormField<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  className,
  form,
}: FormFieldProps<T>) {
  const { control, formState: { errors } } = form
  const error = errors[name]

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-red-500')}>
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(error && 'border-red-500 focus:border-red-500')}
          />
        )}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  )
}

// Form Textarea Component
export function FormTextarea<T extends FieldValues>({
  name,
  label,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  className,
  form,
}: FormTextareaProps<T>) {
  const { control, formState: { errors } } = form
  const error = errors[name]

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-red-500')}>
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={cn(error && 'border-red-500 focus:border-red-500')}
          />
        )}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  )
}

// Form Select Component
export function FormSelect<T extends FieldValues>({
  name,
  label,
  placeholder,
  options,
  required = false,
  disabled = false,
  className,
  form,
}: FormSelectProps<T>) {
  const { control, formState: { errors } } = form
  const error = errors[name]

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className={cn(required && 'after:content-["*"] after:ml-0.5 after:text-red-500')}>
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
            <SelectTrigger className={cn(error && 'border-red-500 focus:border-red-500')}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  )
}

// Form Checkbox Component
export function FormCheckbox<T extends FieldValues>({
  name,
  label,
  required = false,
  disabled = false,
  className,
  form,
}: FormCheckboxProps<T>) {
  const { control, formState: { errors } } = form
  const error = errors[name]

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Checkbox
            id={name}
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
        )}
      />
      {label && (
        <Label
          htmlFor={name}
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            required && 'after:content-["*"] after:ml-0.5 after:text-red-500'
          )}
        >
          {label}
        </Label>
      )}
      {error && (
        <p className="text-sm text-red-500">{error.message as string}</p>
      )}
    </div>
  )
}

// Main Form Component
export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  submitText = 'Submit',
  loading = false,
}: FormProps<T>) {
  const form = useForm<T>({
    resolver: yupResolver(schema),
    defaultValues: defaultValues as T,
  })

  const { handleSubmit, formState: { errors } } = form

  const onSubmitHandler = async (data: T) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
      showValidationError({ general: error })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className={cn('space-y-6', className)}>
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the errors below before submitting.
          </AlertDescription>
        </Alert>
      )}

      {children}

      <Button type="submit" disabled={loading} className="w-full">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitText}
      </Button>
    </form>
  )
}

// Export form instance for use in components
export { useForm } 