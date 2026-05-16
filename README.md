# Cost of Living Calculator

An interactive tool for comparing cost of living across US states and counties. Analyze how your take-home income stacks against real expenses including housing, food, utilities, and taxes—all adjusted for your job, location, and financial situation.

## Overview

This calculator helps answer: **"Can I afford to live here?"** by comparing your gross income against actual monthly expenses across different regions. Input your job title, filing status, and desired 401k contribution, then explore how your money breaks down across states and counties.

## Methodology

### Income Calculation

**Gross Income**: Based on job title and selected percentile (10th, 25th, median, 75th, 90th) from the Occupational Employment and Wage Statistics (OEWS) database.

**Tax Deductions**:
- **401k contributions**: Pre-tax deduction (reduces both taxable income and take-home pay)
- **Federal income tax**: 2024 tax brackets applied to taxable income after standard deduction ($14,600 single, $29,200 MFJ)
- **State income tax**: State-specific rates applied after state standard deduction
- **FICA taxes**:
  - Social Security: 6.2% up to $168,600 wage cap
  - Medicare: 1.45% on all wages

**Net Income**: Gross income minus all tax and 401k deductions

### Expense Categories

1. **Housing**: Median rent by county (ZORI data) or Fair Market Rent (HUD FMR) for different household sizes
2. **Food**: USDA cost estimates based on household composition (adults + children)
3. **Utilities**: Electricity, internet, phone, and car insurance by state/county
4. **Total Monthly Expenses**: Sum of all categories

### Remaining Income

Calculated as: **Net Income - Total Monthly Expenses**

A positive number means affordability; negative indicates the area may be financially challenging for your profile.

## Data Sources

### Employment & Wages
- **OEWS (Bureau of Labor Statistics)**: Occupational Employment and Wage Statistics
  - Job titles and median salaries by Metropolitan Statistical Area (MSA) and state
  - Percentile breakdowns (10th, 25th, 50th, 75th, 90th)

### Housing
- **ZORI (Zillow Research)**: Zillow Observed Rent Index
  - Median rent estimates by county (monthly, studio to 3+ bedroom)
- **HUD FMR (Fair Market Rent)**: U.S. Department of Housing and Urban Development
  - Fair Market Rent for different household sizes (efficiency to 4+ bedroom)

### Food
- **USDA Food Plans**: Cost of food at home by household type
  - Thrifty, low-cost, moderate-cost, and liberal plan options
  - Adjusted for household composition (adults, children, infants)

### Utilities & Services
- **EIA (Energy Information Administration)**: State average electricity rates
- **FCC & Industry Reports**: Internet and phone service cost benchmarks
- **State Insurance Data**: Average auto insurance premiums by state and county

### Tax Data
- **IRS 2024 Tax Brackets**: Federal income tax rates and standard deductions
- **State Revenue Departments**: State income tax rates and deduction amounts
- **SSA & CMS**: FICA tax rates and wage caps

## Features

- **State-Level Analysis**: Aggregate metrics for all 50 US states
- **County-Level Analysis**: Detailed data for ~3,000 US counties
- **Job Search**: Filter by job title and income percentile
- **Multi-State Comparison**: Select multiple states and counties simultaneously
- **Flexible Profiles**: Customize filing status, household type, and 401k rate
- **Pin & Search**: Pin favorite counties or search by name for quick access

## Author

Created by **Snowmanson** — [Twitch](https://www.twitch.tv/mrsnowmanman)

## License

Open source for educational and informational purposes.
