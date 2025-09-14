'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { OMAN_STATES, getGovernorates, getStatesByGovernorate } from '@/lib/constants/oman-states';

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
    placeholder = "اختر الولاية",
    label = "الولاية",
    required = false,
    disabled = false,
    className = ""
}: StateSelectorProps) {
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
        <div className={` flex items-center gap-2   ${className}`}>
            {/* Governorate Selection */}
            <div className="space-y-2">
                <Label htmlFor="governorate" className="text-sm font-medium text-right">
                    المحافظة
                </Label>
                <Select
                    value={selectedGovernorate}
                    onValueChange={handleGovernorateChange}
                    disabled={disabled}
                >
                    <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                        {governorates.map((governorate) => (
                            <SelectItem key={governorate.en} value={governorate.en}>
                                {governorate.ar}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* State Selection */}
            <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium text-right">
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                <Select
                    value={selectedState}
                    onValueChange={handleStateChange}
                    disabled={disabled || !selectedGovernorate}
                >
                    <SelectTrigger className="text-right">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {availableStates.length > 0 ? (
                            availableStates.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                    {state.label.ar}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="no-states" disabled>
                                اختر المحافظة أولاً
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
