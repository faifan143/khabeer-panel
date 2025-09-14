"use client"

import React from "react"
import { useTranslation } from "react-i18next"
import { RTLConfirmationDialog } from "./rtl-confirmation-dialog"
import { Button } from "./button"
import { Trash2, Edit, Save, X } from "lucide-react"

/**
 * Example component demonstrating how to use RTL-aware components
 * This shows the proper way to implement RTL/LTR aware dialogs and buttons
 */
export function RTLComponentsExample() {
    const { t } = useTranslation()

    const handleDelete = () => {
        console.log("Delete action triggered")
    }

    const handleEdit = () => {
        console.log("Edit action triggered")
    }

    const handleSave = () => {
        console.log("Save action triggered")
    }

    return (
        <div className="space-y-4 p-4">
            <h2 className="text-xl font-semibold">RTL-Aware Components Example</h2>

            {/* Example 1: Destructive Action Dialog */}
            <RTLConfirmationDialog
                trigger={
                    <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Item
                    </Button>
                }
                title="Delete Item"
                description="Are you sure you want to delete this item? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDelete}
                confirmVariant="destructive"
            />

            {/* Example 2: Success Action Dialog */}
            <RTLConfirmationDialog
                trigger={
                    <Button variant="default" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Item
                    </Button>
                }
                title="Edit Item"
                description="Are you sure you want to edit this item? Changes will be saved immediately."
                confirmText="Edit"
                cancelText="Cancel"
                onConfirm={handleEdit}
                confirmVariant="default"
                confirmClassName="bg-blue-600 hover:bg-blue-700"
            />

            {/* Example 3: Custom Styled Dialog */}
            <RTLConfirmationDialog
                trigger={
                    <Button variant="outline" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                }
                title="Save Changes"
                description="Do you want to save all your changes? This will update the item with the new information."
                confirmText="Save"
                cancelText="Don't Save"
                onConfirm={handleSave}
                confirmVariant="default"
                confirmClassName="bg-green-600 hover:bg-green-700"
            />

            {/* Example 4: Icon-only Button Dialog */}
            <RTLConfirmationDialog
                trigger={
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100">
                        <X className="h-4 w-4" />
                    </Button>
                }
                title="Remove Item"
                description="This item will be removed from your list. Are you sure?"
                confirmText="Remove"
                cancelText="Keep"
                onConfirm={handleDelete}
                confirmVariant="destructive"
            />
        </div>
    )
}

/**
 * Key Features of RTLConfirmationDialog:
 * 
 * 1. Automatic RTL/LTR Detection: Uses useLanguage hook to detect current language direction
 * 2. Proper Button Ordering: Buttons are automatically reversed in RTL mode
 * 3. Text Alignment: All text is properly aligned based on language direction
 * 4. Icon Positioning: Icons are positioned correctly relative to text
 * 5. Customizable Styling: Supports custom button variants and classes
 * 6. Loading States: Built-in support for loading states
 * 7. Accessibility: Proper ARIA labels and keyboard navigation
 * 
 * Props:
 * - trigger: React node that triggers the dialog
 * - title: Dialog title text
 * - description: Dialog description text
 * - confirmText: Text for confirm button
 * - cancelText: Text for cancel button (optional, defaults to "Cancel")
 * - onConfirm: Function called when confirm is clicked
 * - onCancel: Function called when cancel is clicked (optional)
 * - confirmVariant: Button variant for confirm button (default, destructive, etc.)
 * - confirmClassName: Additional CSS classes for confirm button
 * - isLoading: Whether the dialog is in loading state
 */
