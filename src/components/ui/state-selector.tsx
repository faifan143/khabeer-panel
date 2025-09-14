'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { OMAN_STATES, getGovernorates, getStatesByGovernorate } from '@/lib/constants/oman-states';
import { useTranslation } from 'react-i18next';

interface StateSelectorProps {
    value?: string;
    onChange: (state: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export function StateSelector({
    value,
    onChange,
    placeholder,
    label,
    required = false,
    disabled = false,
    className = ""
}: StateSelectorProps) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [selectedGovernorate, setSelectedGovernorate] = useState<string>("");
    const [selectedState, setSelectedState] = useState<string>("");
    const [availableStates, setAvailableStates] = useState<Array<{ value: string; label: { en: string; ar: string } }>>([]);

    // Initialize selected values from the provided value
    useEffect(() => {
        if (value) {
            // Find the state and its governorate
            for (const governorate of OMAN_STATES) {
                const state = governorate.states.find(s => s.value === value);
                if (state) {
                    setSelectedGovernorate(governorate.governorate.en);
                    setSelectedState(value);
                    setAvailableStates([...governorate.states]);
                    break;
                }
            }
        } else {
            setSelectedGovernorate("");
            setSelectedState("");
            setAvailableStates([]);
        }
    }, [value]);

    const handleGovernorateChange = (governorateEn: string) => {
        setSelectedGovernorate(governorateEn);
        setSelectedState("");
        const states = getStatesByGovernorate(governorateEn);
        setAvailableStates([...states]);
        // Don't call onChange here, wait for state selection
    };

    const handleStateChange = (stateValue: string) => {
        setSelectedState(stateValue);
        onChange(stateValue);
    };

    const governorates = getGovernorates();

    return (
        <div className={`flex items-center gap-2 ${isRTL ? 'rtl:gap-2 ' : ''} ${className}`}>
            {/* Governorate Selection */}
            <div className={`space-y-2 ${isRTL ? 'rtl:space-y-2' : ''}`}>
                <Label htmlFor="governorate" className={`text-sm font-medium ${isRTL ? 'text-right rtl:text-right rtl:block' : 'text-left'}`}>
                    {t('common.governorate')}
                </Label>
                <Select
                    value={selectedGovernorate}
                    onValueChange={handleGovernorateChange}
                    disabled={disabled}
                >
                    <SelectTrigger className={`${isRTL ? 'text-right rtl:text-right rtl:justify-end' : 'text-left'}`}>
                        <SelectValue placeholder={t('common.selectGovernorate')} />
                    </SelectTrigger>
                    <SelectContent className={isRTL ? 'rtl:text-right' : ''}>
                        {governorates.map((governorate) => (
                            <SelectItem key={governorate.en} value={governorate.en} className={isRTL ? 'rtl:text-right' : ''}>
                                {isRTL ? governorate.ar : governorate.en}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* State Selection */}
            <div className={`space-y-2 ${isRTL ? 'rtl:space-y-2' : ''}`}>
                <Label htmlFor="state" className={`text-sm font-medium ${isRTL ? 'text-right rtl:text-right rtl:block' : 'text-left'}`}>
                    {label || t('common.state')} {required && <span className={`text-red-500 ${isRTL ? 'rtl:mr-1' : 'ml-1'}`}>*</span>}
                </Label>
                <Select
                    value={selectedState}
                    onValueChange={handleStateChange}
                    disabled={disabled || !selectedGovernorate}
                >
                    <SelectTrigger className={`${isRTL ? 'text-right rtl:text-right rtl:justify-end' : 'text-left'}`}>
                        <SelectValue placeholder={placeholder || t('common.selectState')} />
                    </SelectTrigger>
                    <SelectContent className={isRTL ? 'rtl:text-right' : ''}>
                        {availableStates.length > 0 ? (
                            availableStates.map((state) => (
                                <SelectItem key={state.value} value={state.value} className={isRTL ? 'rtl:text-right' : ''}>
                                    {isRTL ? state.label.ar : state.label.en}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="no-states" disabled className={isRTL ? 'rtl:text-right' : ''}>
                                {t('common.selectGovernorateFirst')}
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
