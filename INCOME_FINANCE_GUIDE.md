# Income & Finance Page Guide

## Overview

The Income & Finance page provides comprehensive financial management and reporting capabilities for the Khabeer platform. It displays revenue, commissions, discounts, and offers in an organized dashboard format.

## Features

### 1. Financial Summary Cards

- **Total Revenue**: Shows the total revenue generated from all paid invoices
- **Net Income**: Displays net income after deducting commissions and discounts
- **Total Commission**: Shows total commissions paid to providers
- **Total Discounts**: Displays total discounts applied through offers

### 2. Filters & Search

- **Date Range Filtering**: Filter data by start and end dates
- **Search Functionality**: Search through invoices and offers by customer, provider, or service name
- **Real-time Filtering**: Apply filters to see updated data immediately

### 3. Invoices Tab

Displays detailed invoice information including:

- Invoice ID and Order ID
- Customer and Provider details
- Service information
- Financial breakdown (Total Amount, Discount, Commission, Net Amount)
- Payment date
- Action buttons for viewing details

### 4. Offers Tab

Shows all offers and discounts including:

- Provider information with verification status
- Service details
- Original and offer prices
- Discount amount and percentage
- Valid period (start and end dates)
- Active/Expired status

### 5. Financial Summary Footer

Comprehensive overview showing:

- Total Revenue, Commissions, Discounts, and Net Income
- Total Invoices, Offers, and Active Offers counts
- Color-coded financial metrics for easy identification

## API Endpoints Used

### Backend Endpoints

- `GET /admin/revenue` - Get revenue statistics
- `GET /admin/reports/revenue` - Get detailed revenue report with invoices
- `GET /offers` - Get all offers
- `GET /offers?activeOnly=true` - Get active offers only

### Frontend Services

- `FinanceService.getRevenueStats()` - Revenue statistics
- `FinanceService.getRevenueReport()` - Detailed invoice data
- `FinanceService.getOffers()` - All offers data
- `FinanceService.getFinancialSummary()` - Combined financial summary

## Data Structure

### Invoice Data

```typescript
interface InvoiceData {
  invoiceId: number;
  orderId: number;
  paymentDate: string;
  totalAmount: number;
  discount: number;
  netAmount: number;
  commission: number;
  user: { name: string; email: string };
  provider: { name: string; phone: string };
  service: { title: string; commission: number };
  paymentStatus?: string;
}
```

### Offer Data

```typescript
interface OfferData {
  id: number;
  provider: { id: number; name: string; image: string; isVerified: boolean };
  service: { id: number; title: string; description: string; image: string };
  startDate: string;
  endDate: string;
  originalPrice: number;
  offerPrice: number;
  description: string;
  isActive: boolean;
  discountAmount: number;
  discountPercentage: number;
}
```

### Financial Summary

```typescript
interface FinancialSummary {
  totalRevenue: number;
  totalCommission: number;
  totalDiscounts: number;
  netIncome: number;
  totalOffers: number;
  activeOffers: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  totalTransactions: number;
}
```

## Usage Instructions

1. **Access the Page**: Navigate to `/income` in the admin panel
2. **View Summary**: Check the financial summary cards at the top
3. **Filter Data**: Use date range and search filters to narrow down results
4. **Switch Tabs**: Toggle between Invoices and Offers tabs
5. **View Details**: Click the eye icon to view detailed information
6. **Refresh Data**: Click the "Refresh Data" button to update information

## Currency Formatting

All monetary values are displayed in OMR (Omani Rial) with proper formatting:

- Example: `OMR 1,234.56`
- Negative values are shown with a minus sign for discounts and commissions

## Error Handling

- Loading states are displayed while fetching data
- Error messages are shown if data loading fails
- Empty states are displayed when no data is available
- Toast notifications for user feedback

## Responsive Design

The page is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile devices

## Future Enhancements

- Export functionality for reports
- Advanced analytics and charts
- Real-time data updates
- Email notifications for financial milestones
- Integration with accounting software
