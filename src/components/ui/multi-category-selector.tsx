"use client";

import React, { useMemo } from "react";
import Select, { MultiValue, SingleValue, ActionMeta } from "react-select";
import { Label } from "./label";
import { Category } from "@/lib/api/types";
import { useTranslation } from "react-i18next";
import { getLocalizedStateName } from "@/lib/constants/oman-states";

interface CategoryOption {
  value: number;
  label: string;
  state: string;
}

interface MultiCategorySelectorProps {
  value?: number[];
  onChange: (categoryIds: number[]) => void;
  categories: Category[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  isMulti?: boolean;
}

export function MultiCategorySelector({
  value = [],
  onChange,
  categories,
  placeholder,
  label,
  required = false,
  disabled = false,
  className = "",
  isMulti = true,
}: MultiCategorySelectorProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Create category options grouped by state
  const categoryOptions = useMemo(() => {
    const options: CategoryOption[] = [];
    categories.forEach((category) => {
      options.push({
        value: category.id,
        label: `${category.titleAr} - ${category.titleEn}`,
        state: category.state || t("common.noState"),
      });
    });
    return options;
  }, [categories, t]);

  // Group options by state for better organization
  const groupedOptions = useMemo(() => {
    const groups: { [key: string]: CategoryOption[] } = {};
    categoryOptions.forEach((option) => {
      if (!groups[option.state]) {
        groups[option.state] = [];
      }
      groups[option.state].push(option);
    });
    return groups;
  }, [categoryOptions]);

  const handleCategoryChange = (
    selectedOptions: MultiValue<CategoryOption> | SingleValue<CategoryOption>,
    actionMeta: ActionMeta<CategoryOption>
  ) => {
    if (Array.isArray(selectedOptions)) {
      const categoryIds = selectedOptions.map((option) => option.value);
      onChange(categoryIds);
    } else {
      onChange([]);
    }
  };

  // Get current selected options for react-select
  const selectedOptions = useMemo(() => {
    return categoryOptions.filter((option) => value.includes(option.value));
  }, [categoryOptions, value]);

  // Custom styles for react-select
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "40px",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#e0e7ff",
      borderRadius: "6px",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "#3730a3",
      fontSize: "14px",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#6b7280",
      "&:hover": {
        backgroundColor: "#c7d2fe",
        color: "#3730a3",
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#9ca3af",
      fontSize: "14px",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 50,
    }),
  };

  return (
    <div className={`space-y-2 ${isRTL ? "rtl:space-y-2" : ""} ${className}`}>
      <Label
        htmlFor="categories"
        className={`text-sm font-medium ${
          isRTL ? "text-right rtl:text-right rtl:block" : "text-left"
        }`}
      >
        {label || t("categories.normalServiceForm.category")}{" "}
        {required && (
          <span className={`text-red-500 ${isRTL ? "rtl:mr-1" : "ml-1"}`}>
            *
          </span>
        )}
      </Label>
      <Select
        isMulti={isMulti}
        value={selectedOptions}
        onChange={handleCategoryChange}
        options={categoryOptions}
        placeholder={
          placeholder || t("categories.normalServiceForm.selectCategory")
        }
        isDisabled={disabled}
        isClearable
        isSearchable
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
        styles={customStyles}
        className="react-select-container"
        classNamePrefix="react-select"
        formatOptionLabel={(option: CategoryOption) => (
          <div className={`${isRTL ? "text-right" : "text-left"}`}>
            <div className="font-medium">{option.label}</div>
            <div className="text-xs text-gray-500">
              {getLocalizedStateName(
                option.state,
                i18n.language as "en" | "ar"
              )}
            </div>
          </div>
        )}
        noOptionsMessage={() => (
          <div
            className={`${
              isRTL ? "text-right" : "text-left"
            } text-gray-500 py-2`}
          >
            {t("categories.noCategoriesFound")}
          </div>
        )}
      />
    </div>
  );
}
