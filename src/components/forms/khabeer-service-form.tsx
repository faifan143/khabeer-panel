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

interface KhabeerServiceFormProps {
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

export function KhabeerServiceForm({
  isOpen,
  onClose,
  onSubmit,
  selectedService,
  categories,
  isLoading,
}: KhabeerServiceFormProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [serviceForm, setServiceForm] = useState<CreateServiceDto>({
    titleAr: selectedService?.titleAr || "",
    titleEn: selectedService?.titleEn || "",
    description: selectedService?.description || "",
    whatsapp: selectedService?.whatsapp || "",
    categoryId: selectedService?.categoryId || undefined,
    serviceType: "KHABEER",
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
        description: selectedService.description || "",
        whatsapp: selectedService.whatsapp || "",
        categoryId: selectedService.categoryId || undefined,
        serviceType: "KHABEER",
      });
      // Set selected categories - for now, use single categoryId if available
      setSelectedCategories(
        selectedService.categoryId ? [selectedService.categoryId] : []
      );
    } else {
      setServiceForm({
        titleAr: "",
        titleEn: "",
        description: "",
        whatsapp: "",
        categoryId: undefined,
        serviceType: "KHABEER",
      });
      setSelectedCategories([]);
    }

    setServiceImageFile(null);
  }, [selectedService, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for KHABEER services - categories are required
    if (selectedCategories.length === 0) {
      // Show error toast
      return;
    }

    try {
      // If multiple categories selected, use bulk creation
      if (selectedCategories.length > 1) {
        const bulkServiceData = {
          titleAr: serviceForm.titleAr,
          titleEn: serviceForm.titleEn,
          description: serviceForm.description || "",
          commission: 0, // KHABEER services don't have commission
          serviceType: "KHABEER" as const,
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
      <DialogContent className="sm:max-w-[700px]" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader className={isRTL ? "rtl:text-right" : ""}>
          <DialogTitle
            className={`${isRTL ? "rtl:text-right rtl:font-semibold" : ""}`}
          >
            {selectedService
              ? t("categories.khabeerServiceForm.editTitle")
              : t("categories.khabeerServiceForm.title")}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className={`space-y-6 ${isRTL ? "rtl:space-y-6" : ""}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`space-y-2 ${isRTL ? "rtl:space-y-2" : ""}`}>
              <Label
                htmlFor="serviceTitleAr"
                className={`text-sm font-medium ${
                  isRTL ? "text-right rtl:text-right rtl:block" : "text-left"
                }`}
              >
                {t("categories.khabeerServiceForm.arabicTitle")}{" "}
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
                placeholder={t(
                  "categories.khabeerServiceForm.enterArabicTitle"
                )}
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
                {t("categories.khabeerServiceForm.englishTitle")}{" "}
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
                  "categories.khabeerServiceForm.enterEnglishTitle"
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

          <div className={`space-y-2 ${isRTL ? "rtl:space-y-2" : ""}`}>
            <Label
              htmlFor="description"
              className={`text-sm font-medium ${
                isRTL ? "text-right rtl:text-right rtl:block" : "text-left"
              }`}
            >
              {t("categories.khabeerServiceForm.description")}{" "}
              <span className={`text-red-500 ${isRTL ? "rtl:mr-1" : "ml-1"}`}>
                *
              </span>
            </Label>
            <Textarea
              id="description"
              value={serviceForm.description}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, description: e.target.value })
              }
              placeholder={t("categories.khabeerServiceForm.enterDescription")}
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
              htmlFor="whatsapp"
              className={`text-sm font-medium ${
                isRTL ? "text-right rtl:text-right rtl:block" : "text-left"
              }`}
            >
              {t("categories.khabeerServiceForm.whatsapp")}{" "}
              <span className={`text-red-500 ${isRTL ? "rtl:mr-1" : "ml-1"}`}>
                *
              </span>
            </Label>
            <Input
              id="whatsapp"
              value={serviceForm.whatsapp}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, whatsapp: e.target.value })
              }
              placeholder={t("categories.khabeerServiceForm.enterWhatsapp")}
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
            placeholder={t("categories.khabeerServiceForm.selectCategory")}
            label={t("categories.khabeerServiceForm.category")}
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
              {t("categories.khabeerServiceForm.serviceImage")}
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
                {t("categories.khabeerServiceForm.fileSelected")}{" "}
                {serviceImageFile.name}
              </p>
            )}
            {selectedService?.image && !serviceImageFile && (
              <p
                className={`text-xs text-muted-foreground ${
                  isRTL ? "text-right rtl:text-right" : "text-left"
                }`}
              >
                {t("categories.khabeerServiceForm.currentImage")}{" "}
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
              className={`w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ${
                isRTL ? "rtl:w-full rtl:sm:w-auto" : ""
              }`}
            >
              {selectedService
                ? t("categories.khabeerServiceForm.updateService")
                : t("categories.khabeerServiceForm.createService")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
