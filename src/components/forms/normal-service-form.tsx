"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import {
  CreateServiceDto,
  UpdateServiceDto,
  Service,
  Category,
} from "@/lib/api/types";
import { Upload } from "lucide-react";
import { MultiCategorySelector } from "@/components/ui/multi-category-selector";

interface NormalServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    serviceData: CreateServiceDto | UpdateServiceDto,
    imageFile?: File
  ) => Promise<void>;
  selectedService?: Service | null;
  categories: Category[];
  isLoading: boolean;
}

export function NormalServiceForm({
  isOpen,
  onClose,
  onSubmit,
  selectedService,
  categories,
  isLoading,
}: NormalServiceFormProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [serviceForm, setServiceForm] = useState<CreateServiceDto>({
    titleAr: selectedService?.titleAr || "",
    titleEn: selectedService?.titleEn || "",
    descriptionAr: selectedService?.descriptionAr || "",
    descriptionEn: selectedService?.descriptionEn || "",
    commission: selectedService?.commission || 0,
    categoryId: selectedService?.categoryId || undefined,
    serviceType: "NORMAL",
  });
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);

  // Keep form values in sync when editing different services or when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    if (selectedService) {
      setServiceForm({
        titleAr: selectedService.titleAr || "",
        titleEn: selectedService.titleEn || "",
        descriptionAr: selectedService.descriptionAr || "",
        descriptionEn: selectedService.descriptionEn || "",
        commission: selectedService.commission || 0,
        categoryId: selectedService.categoryId || undefined,
        serviceType: "NORMAL",
      });
      // Set selected categories - for now, use single categoryId if available
      setSelectedCategories(
        selectedService.categoryId ? [selectedService.categoryId] : []
      );
    } else {
      setServiceForm({
        titleAr: "",
        titleEn: "",
        descriptionAr: "",
        descriptionEn: "",
        commission: 0,
        categoryId: undefined,
        serviceType: "NORMAL",
      });
      setSelectedCategories([]);
    }

    setServiceImageFile(null);
  }, [selectedService, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for NORMAL services
    if (selectedCategories.length === 0) {
      // Show error toast
      return;
    }

    if (!serviceForm.commission || serviceForm.commission <= 0) {
      // Show error toast
      return;
    }

    try {
      // If multiple categories selected, use bulk creation
      if (selectedCategories.length > 1) {
        const bulkServiceData = {
          titleAr: serviceForm.titleAr,
          titleEn: serviceForm.titleEn,
          descriptionAr: serviceForm.descriptionAr || "",
          descriptionEn: serviceForm.descriptionEn || "",
          commission: serviceForm.commission,
          serviceType: "NORMAL" as const,
          categoryIds: selectedCategories,
        };
        await onSubmit(bulkServiceData, serviceImageFile || undefined);
      } else {
        // Single category, use regular creation
        const singleServiceData = {
          ...serviceForm,
          categoryId: selectedCategories[0],
        };
        await onSubmit(singleServiceData, serviceImageFile || undefined);
      }
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleImageUpload = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

    if (file.size > maxSize) {
      // Show error toast
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      // Show error toast
      return;
    }

    setServiceImageFile(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className={isRTL ? "rtl:text-right" : ""}>
          <DialogTitle
            className={`${isRTL ? "rtl:text-right rtl:font-semibold" : ""}`}
          >
            {selectedService
              ? t("categories.normalServiceForm.editTitle")
              : t("categories.normalServiceForm.title")}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className={`space-y-6 ${isRTL ? "rtl:space-y-6" : ""}`}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className={`space-y-2 ${isRTL ? "rtl:space-y-2" : ""}`}>
              <Label
                htmlFor="serviceTitleAr"
                className={`text-sm font-medium ${
                  isRTL ? "text-right rtl:text-right rtl:block" : "text-left"
                }`}
              >
                {t("categories.normalServiceForm.arabicTitle")}{" "}
                <span className={`text-red-500 ${isRTL ? "rtl:mr-1" : "ml-1"}`}>
                  *
                </span>
              </Label>
              <Input
                id="serviceTitleAr"
                value={serviceForm.titleAr}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, titleAr: e.target.value })
                }
                placeholder={t("categories.normalServiceForm.enterArabicTitle")}
                required
                className={`${
                  isRTL
                    ? "text-right rtl:text-right rtl:placeholder:text-right"
                    : "text-left"
                }`}
              />
            </div>
            <div className={`space-y-2 ${isRTL ? "rtl:space-y-2" : ""}`}>
              <Label
                htmlFor="serviceTitleEn"
                className={`text-sm font-medium ${
                  isRTL ? "text-right rtl:text-right rtl:block" : "text-left"
                }`}
              >
                {t("categories.normalServiceForm.englishTitle")}{" "}
                <span className={`text-red-500 ${isRTL ? "rtl:mr-1" : "ml-1"}`}>
                  *
                </span>
              </Label>
              <Input
                id="serviceTitleEn"
                value={serviceForm.titleEn}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, titleEn: e.target.value })
                }
                placeholder={t(
                  "categories.normalServiceForm.enterEnglishTitle"
                )}
                required
                className={`${
                  isRTL
                    ? "text-right rtl:text-right rtl:placeholder:text-right"
                    : "text-left"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`space-y-2 ${isRTL ? "rtl:space-y-2" : ""}`}>
              <Label
                htmlFor="descriptionAr"
                className={`text-sm font-medium ${
                  isRTL ? "text-right rtl:text-right rtl:block" : "text-left"
                }`}
              >
                {t("categories.normalServiceForm.arabicDescription")}{" "}
                <span className={`text-red-500 ${isRTL ? "rtl:mr-1" : "ml-1"}`}>
                  *
                </span>
              </Label>
              <Textarea
                id="descriptionAr"
                value={serviceForm.descriptionAr}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    descriptionAr: e.target.value,
                  })
                }
                placeholder={t(
                  "categories.normalServiceForm.enterArabicDescription"
                )}
                rows={3}
                required
                className={`${
                  isRTL
                    ? "text-right rtl:text-right rtl:placeholder:text-right"
                    : "text-left"
                } resize-none`}
              />
            </div>
            <div className={`space-y-2 ${isRTL ? "rtl:space-y-2" : ""}`}>
              <Label
                htmlFor="descriptionEn"
                className={`text-sm font-medium ${
                  isRTL ? "text-right rtl:text-right rtl:block" : "text-left"
                }`}
              >
                {t("categories.normalServiceForm.englishDescription")}{" "}
                <span className={`text-red-500 ${isRTL ? "rtl:mr-1" : "ml-1"}`}>
                  *
                </span>
              </Label>
              <Textarea
                id="descriptionEn"
                value={serviceForm.descriptionEn}
                onChange={(e) =>
                  setServiceForm({
                    ...serviceForm,
                    descriptionEn: e.target.value,
                  })
                }
                placeholder={t(
                  "categories.normalServiceForm.enterEnglishDescription"
                )}
                rows={3}
                required
                className={`${
                  isRTL
                    ? "text-right rtl:text-right rtl:placeholder:text-right"
                    : "text-left"
                } resize-none`}
              />
            </div>
          </div>

          <div className={`space-y-2 ${isRTL ? "rtl:space-y-2" : ""}`}>
            <Label
              htmlFor="commission"
              className={`text-sm font-medium ${
                isRTL ? "text-right rtl:text-right rtl:block" : "text-left"
              }`}
            >
              {t("categories.normalServiceForm.commission")}{" "}
              <span className={`text-red-500 ${isRTL ? "rtl:mr-1" : "ml-1"}`}>
                *
              </span>
            </Label>
            <Input
              id="commission"
              type="number"
              step="0.01"
              min="0"
              value={serviceForm.commission}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  commission: parseFloat(e.target.value) || 0,
                })
              }
              placeholder={t("categories.normalServiceForm.enterCommission")}
              required
              className={`${
                isRTL
                  ? "text-right rtl:text-right rtl:placeholder:text-right"
                  : "text-left"
              }`}
            />
          </div>
          <MultiCategorySelector
            value={selectedCategories}
            onChange={setSelectedCategories}
            categories={categories}
            placeholder={t("categories.normalServiceForm.selectCategory")}
            label={t("categories.normalServiceForm.category")}
            required
            isMulti={true}
          />

          <div className={`space-y-2 ${isRTL ? "rtl:space-y-2" : ""}`}>
            <Label
              htmlFor="serviceImage"
              className={`text-sm font-medium ${
                isRTL ? "text-right rtl:text-right rtl:block" : "text-left"
              }`}
            >
              {t("categories.normalServiceForm.serviceImage")}
            </Label>
            <div
              className={`flex items-center gap-2 ${isRTL ? "rtl:gap-2 " : ""}`}
            >
              <Input
                id="serviceImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {serviceImageFile && (
              <p
                className={`text-xs text-green-600 ${
                  isRTL ? "text-right rtl:text-right" : "text-left"
                }`}
              >
                {t("categories.normalServiceForm.fileSelected")}{" "}
                {serviceImageFile.name}
              </p>
            )}
            {selectedService?.image && !serviceImageFile && (
              <p
                className={`text-xs text-muted-foreground ${
                  isRTL ? "text-right rtl:text-right" : "text-left"
                }`}
              >
                {t("categories.normalServiceForm.currentImage")}{" "}
                {selectedService.image}
              </p>
            )}
          </div>

          <DialogFooter
            className={`flex flex-col sm:flex-row gap-2 ${
              isRTL ? "rtl:gap-2 " : ""
            }`}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className={`w-full sm:w-auto ${
                isRTL ? "rtl:w-full rtl:sm:w-auto" : ""
              }`}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 ${
                isRTL ? "rtl:w-full rtl:sm:w-auto" : ""
              }`}
            >
              {selectedService
                ? t("categories.normalServiceForm.updateService")
                : t("categories.normalServiceForm.createService")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
