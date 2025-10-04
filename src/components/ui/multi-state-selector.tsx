"use client";

import React, { useState, useEffect, useMemo } from "react";
import Select, { MultiValue, SingleValue, ActionMeta } from "react-select";
import { Label } from "./label";
import {
  OMAN_STATES,
  getGovernorates,
  getStatesByGovernorate,
} from "@/lib/constants/oman-states";
import { useTranslation } from "react-i18next";

interface StateOption {
  value: string;
  label: string;
  governorate: string;
}

interface GovernorateOption {
  value: string;
  label: string;
}

interface MultiStateSelectorProps {
  value?: string[];
  onChange: (states: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  isMulti?: boolean;
  selectedGovernorates?: string[];
  onGovernorateChange?: (governorates: string[]) => void;
}

export function MultiStateSelector({
  value = [],
  onChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  className = "",
  isMulti = true,
  selectedGovernorates = [],
  onGovernorateChange,
}: MultiStateSelectorProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [availableStates, setAvailableStates] = useState<StateOption[]>([]);

  // Create governorate options
  const governorateOptions = useMemo(() => {
    const governorates = getGovernorates();
    return governorates.map((governorate) => ({
      value: governorate.en,
      label: isRTL ? governorate.ar : governorate.en,
    }));
  }, [isRTL]);

  // Create all state options grouped by governorate
  const allStateOptions = useMemo(() => {
    const options: StateOption[] = [];
    OMAN_STATES.forEach((governorate) => {
      governorate.states.forEach((state) => {
        options.push({
          value: state.value,
          label: isRTL ? state.label.ar : state.label.en,
          governorate: isRTL
            ? governorate.governorate.ar
            : governorate.governorate.en,
        });
      });
    });
    return options;
  }, [isRTL]);

  // Filter states based on selected governorates
  const filteredStateOptions = useMemo(() => {
    if (selectedGovernorates.length === 0) {
      return allStateOptions;
    }
    return allStateOptions.filter((option) => {
      return selectedGovernorates.some((selectedGov) => {
        const governorate = OMAN_STATES.find(
          (g) =>
            g.governorate.en === selectedGov || g.governorate.ar === selectedGov
        );
        return governorate?.states.some((s) => s.value === option.value);
      });
    });
  }, [selectedGovernorates, allStateOptions]);

  // Update available states when governorates change
  useEffect(() => {
    if (selectedGovernorates.length > 0) {
      const stateOptions: StateOption[] = [];
      selectedGovernorates.forEach((selectedGov) => {
        const states = getStatesByGovernorate(selectedGov);
        states.forEach((state) => {
          stateOptions.push({
            value: state.value,
            label: isRTL ? state.label.ar : state.label.en,
            governorate: selectedGov,
          });
        });
      });
      setAvailableStates(stateOptions);
    } else {
      setAvailableStates(allStateOptions);
    }
  }, [selectedGovernorates, allStateOptions, isRTL]);

  const handleGovernorateChange = (
    selectedOptions:
      | MultiValue<GovernorateOption>
      | SingleValue<GovernorateOption>,
    actionMeta: ActionMeta<GovernorateOption>
  ) => {
    if (Array.isArray(selectedOptions)) {
      const governorateValues = selectedOptions.map((option) => option.value);
      onGovernorateChange?.(governorateValues);
    } else {
      onGovernorateChange?.([]);
    }
    // Clear selected states when governorates change
    onChange([]);
  };

  const handleStateChange = (
    selectedOptions: MultiValue<StateOption> | SingleValue<StateOption>,
    actionMeta: ActionMeta<StateOption>
  ) => {
    if (Array.isArray(selectedOptions)) {
      const stateValues = selectedOptions.map((option) => option.value);
      onChange(stateValues);
    } else {
      onChange([]);
    }
  };

  // Get current selected governorate options for react-select
  const selectedGovernorateOptions = useMemo(() => {
    return governorateOptions.filter((option) =>
      selectedGovernorates.includes(option.value)
    );
  }, [governorateOptions, selectedGovernorates]);

  // Get current selected state options for react-select
  const selectedStateOptions = useMemo(() => {
    return allStateOptions.filter((option) => value.includes(option.value));
  }, [allStateOptions, value]);

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
    <div className={`space-y-4 ${isRTL ? "rtl:space-y-4" : ""} ${className}`}>
      {/* Governorate Selection */}
      <div className={`space-y-2 ${isRTL ? "rtl:space-y-2" : ""}`}>
        <Label
          htmlFor="governorate"
          className={`text-sm font-medium ${
            isRTL ? "text-right rtl:text-right rtl:block" : "text-left"
          }`}
        >
          {t("common.governorate")}
        </Label>
        <Select
          isMulti={true}
          value={selectedGovernorateOptions}
          onChange={handleGovernorateChange}
          options={governorateOptions}
          placeholder={t("common.allGovernorates")}
          isDisabled={disabled}
          isClearable
          isSearchable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
          noOptionsMessage={() => (
            <div
              className={`${
                isRTL ? "text-right" : "text-left"
              } text-gray-500 py-2`}
            >
              {t("common.noGovernoratesFound")}
            </div>
          )}
        />
      </div>

      {/* State Selection */}
      <div className={`space-y-2 ${isRTL ? "rtl:space-y-2" : ""}`}>
        <Label
          htmlFor="states"
          className={`text-sm font-medium ${
            isRTL ? "text-right rtl:text-right rtl:block" : "text-left"
          }`}
        >
          {label || t("common.states")}{" "}
          {required && (
            <span className={`text-red-500 ${isRTL ? "rtl:mr-1" : "ml-1"}`}>
              *
            </span>
          )}
        </Label>
        <Select
          isMulti={isMulti}
          value={selectedStateOptions}
          onChange={handleStateChange}
          options={filteredStateOptions}
          placeholder={placeholder || t("common.selectStates")}
          isDisabled={disabled}
          isClearable
          isSearchable
          closeMenuOnSelect={false}
          hideSelectedOptions={false}
          styles={customStyles}
          className="react-select-container"
          classNamePrefix="react-select"
          formatOptionLabel={(option: StateOption) => (
            <div className={`${isRTL ? "text-right" : "text-left"}`}>
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-gray-500">{option.governorate}</div>
            </div>
          )}
          noOptionsMessage={() => (
            <div
              className={`${
                isRTL ? "text-right" : "text-left"
              } text-gray-500 py-2`}
            >
              {selectedGovernorates.length > 0
                ? t("common.noStatesInGovernorate")
                : t("common.selectGovernorateFirst")}
            </div>
          )}
        />
      </div>
    </div>
  );
}
