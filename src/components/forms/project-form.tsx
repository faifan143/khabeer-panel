'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormTextarea, FormSelect, FormCheckbox } from '@/components/ui/form'
import { projectSchema, ProjectFormData } from '@/lib/validations/schemas'
import { showSuccess, showError } from '@/lib/utils/toast'
import { Calendar, DollarSign, Users, FolderOpen } from 'lucide-react'

const projectCategories = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'other', label: 'Other' },
]

const teamMembers = [
  { value: 'john-doe', label: 'John Doe' },
  { value: 'jane-smith', label: 'Jane Smith' },
  { value: 'mike-johnson', label: 'Mike Johnson' },
  { value: 'sarah-wilson', label: 'Sarah Wilson' },
  { value: 'alex-brown', label: 'Alex Brown' },
]

export function ProjectForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: ProjectFormData) => {
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Project data:', data)

      showSuccess(`Project "${data.name}" has been created successfully!`, 'Project Created')

      // Reset form or redirect
    } catch (error) {
      showError('Failed to create project. Please try again.', 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto glass-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 cyber-gradient-text">
          <div className="p-2 rounded-lg bg-cyan-500/20 neon-glow">
            <FolderOpen className="h-5 w-5 text-cyan-400" />
          </div>
          Create New Project
        </CardTitle>
        <CardDescription className="text-gray-400">
          Fill in the details below to create a new project for your team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={projectSchema}
          onSubmit={handleSubmit}
          submitText="Create Project"
          loading={loading}
          defaultValues={{
            name: '',
            description: '',
            category: '',
            startDate: undefined,
            endDate: undefined,
            budget: 0,
            teamMembers: [],
          }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              name="name"
              label="Project Name"
              placeholder="Enter project name"
              required
              form={{} as any} // This will be provided by the Form component
            />

            <FormSelect
              name="category"
              label="Category"
              placeholder="Select category"
              options={projectCategories}
              required
              form={{} as any}
            />
          </div>

          <FormTextarea
            name="description"
            label="Description"
            placeholder="Describe your project..."
            rows={4}
            required
            form={{} as any}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              name="startDate"
              label="Start Date"
              type="text"
              placeholder="YYYY-MM-DD"
              required
              form={{} as any}
            />

            <FormField
              name="endDate"
              label="End Date"
              type="text"
              placeholder="YYYY-MM-DD"
              required
              form={{} as any}
            />
          </div>

          <FormField
            name="budget"
            label="Budget"
            type="number"
            placeholder="Enter budget amount"
            required
            form={{} as any}
          />

          <div className="space-y-4">
            <label className="text-sm font-medium">Team Members</label>
            <div className="grid gap-3 md:grid-cols-2">
              {teamMembers.map((member) => (
                <FormCheckbox
                  key={member.value}
                  name="teamMembers"
                  label={member.label}
                  form={{} as any}
                />
              ))}
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  )
} 