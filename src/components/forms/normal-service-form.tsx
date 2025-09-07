'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from 'react-i18next'
import { CreateServiceDto, UpdateServiceDto, Service, Category } from '@/lib/api/types'
import { Upload } from 'lucide-react'

interface NormalServiceFormProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (serviceData: CreateServiceDto | UpdateServiceDto, imageFile?: File) => Promise<void>
    selectedService?: Service | null
    categories: Category[]
    isLoading: boolean
}

// Oman Governorates constant
const OMAN_GOVERNORATES = [
    { value: "Muscat", label: "Muscat - مسقط" },
    { value: "Dhofar", label: "Dhofar - ظفار" },
    { value: "Musandam", label: "Musandam - مسندم" },
    { value: "Buraimi", label: "Buraimi - البريمي" },
    { value: "Dakhiliyah", label: "Dakhiliyah - الداخلية" },
    { value: "North Al Batinah", label: "North Al Batinah - شمال الباطنة" },
    { value: "South Al Batinah", label: "South Al Batinah - جنوب الباطنة" },
    { value: "North Al Sharqiyah", label: "North Al Sharqiyah - شمال الشرقية" },
    { value: "South Al Sharqiyah", label: "South Al Sharqiyah - جنوب الشرقية" },
    { value: "Al Wusta", label: "Al Wusta - الوسطى" }
]

export function NormalServiceForm({
    isOpen,
    onClose,
    onSubmit,
    selectedService,
    categories,
    isLoading
}: NormalServiceFormProps) {
    const { t } = useTranslation()
    const [serviceForm, setServiceForm] = useState<CreateServiceDto>({
        title: selectedService?.title || "",
        description: selectedService?.description || "",
        commission: selectedService?.commission || 0,
        whatsapp: selectedService?.whatsapp || "",
        categoryId: selectedService?.categoryId || undefined,
        state: selectedService?.state || undefined,
        serviceType: 'NORMAL'
    })
    const [serviceImageFile, setServiceImageFile] = useState<File | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation for NORMAL services
        if (!serviceForm.categoryId) {
            // Show error toast
            return
        }

        if (!serviceForm.commission || serviceForm.commission <= 0) {
            // Show error toast
            return
        }

        try {
            await onSubmit(serviceForm, serviceImageFile || undefined)
            onClose()
        } catch (error) {
            // Error handling is done in parent component
        }
    }

    const handleImageUpload = (file: File) => {
        const maxSize = 5 * 1024 * 1024 // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']

        if (file.size > maxSize) {
            // Show error toast
            return
        }

        if (!allowedTypes.includes(file.type)) {
            // Show error toast
            return
        }

        setServiceImageFile(file)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>
                        {selectedService ? 'تعديل الخدمة' : 'إضافة خدمة عادية'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="serviceTitle" className="text-sm font-medium text-right">
                            عنوان الخدمة <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="serviceTitle"
                            value={serviceForm.title}
                            onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                            placeholder="أدخل عنوان الخدمة"
                            required
                            className="text-right"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-right">
                            الوصف <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            value={serviceForm.description}
                            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                            placeholder="أدخل وصف الخدمة"
                            rows={3}
                            required
                            className="text-right"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="commission" className="text-sm font-medium text-right">
                                العمولة (ر.ع.) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="commission"
                                type="number"
                                step="0.01"
                                min="0"
                                value={serviceForm.commission}
                                onChange={(e) => setServiceForm({ ...serviceForm, commission: parseFloat(e.target.value) || 0 })}
                                placeholder="أدخل مبلغ العمولة"
                                required
                                className="text-right"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp" className="text-sm font-medium text-right">
                                رقم الواتساب <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="whatsapp"
                                value={serviceForm.whatsapp}
                                onChange={(e) => setServiceForm({ ...serviceForm, whatsapp: e.target.value })}
                                placeholder="أدخل رقم الواتساب"
                                required
                                className="text-right"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="categoryId" className="text-sm font-medium text-right">
                            الفئة <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={serviceForm.categoryId?.toString() || ""}
                            onValueChange={(value) => {
                                if (value) {
                                    setServiceForm({ ...serviceForm, categoryId: parseInt(value) })
                                }
                            }}
                        >
                            <SelectTrigger className="text-right">
                                <SelectValue placeholder="اختر الفئة" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.titleAr} - {category.titleEn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="serviceImage" className="text-sm font-medium text-right">
                            صورة الخدمة
                        </Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="serviceImage"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageUpload(file)
                                }}
                                className="flex-1"
                            />
                            <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {serviceImageFile && (
                            <p className="text-xs text-green-600 text-right">
                                تم اختيار: {serviceImageFile.name}
                            </p>
                        )}
                        {selectedService?.image && !serviceImageFile && (
                            <p className="text-xs text-muted-foreground text-right">
                                الصورة الحالية: {selectedService.image}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="flex-row-reverse">
                        <Button type="button" variant="outline" onClick={onClose}>
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            {selectedService ? 'تحديث الخدمة' : 'إنشاء الخدمة'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
