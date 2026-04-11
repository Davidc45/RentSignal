/**
 * Affordability calculation utility
 * 
 * Uses the standard affordability rules:
 * - Affordable: ≤ 30% of income
 * - Stretch: 30% - 40% of income
 * - Not Recommended: > 40% of income
 */

/**
 * Calculate the rent-to-income ratio as a percentage
 * @param monthlyRent - Monthly rent amount in dollars
 * @param annualSalary - Annual salary in dollars
 * @returns Percentage of monthly income spent on rent (rounded to nearest whole number)
 */
export function calculateAffordabilityRatio(monthlyRent: number, annualSalary: number): number {
  const monthlyIncome = annualSalary / 12
  const ratio = (monthlyRent / monthlyIncome) * 100
  return Math.round(ratio)
}

/**
 * Determine affordability status based on rent-to-income ratio
 * @param monthlyRent - Monthly rent amount in dollars
 * @param annualSalary - Annual salary in dollars
 * @returns Affordability status: "Affordable", "Stretch", or "Not Recommended"
 */
export function getAffordabilityStatus(
  monthlyRent: number,
  annualSalary: number
): 'Affordable' | 'Stretch' | 'Not Recommended' {
  const monthlyIncome = annualSalary / 12
  const ratio = (monthlyRent / monthlyIncome) * 100

  if (ratio <= 30) {
    return 'Affordable'
  } else if (ratio <= 40) {
    return 'Stretch'
  } else {
    return 'Not Recommended'
  }
}
