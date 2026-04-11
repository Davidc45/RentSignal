import { calculateAffordabilityRatio, getAffordabilityStatus } from '../affordability'

describe('Affordability Calculations', () => {
  describe('calculateAffordabilityRatio', () => {
    it('should calculate rent-to-income percentage correctly', () => {
      // Annual salary: $60,000, Monthly income: $5,000
      // Rent: $1,500
      // Ratio: 1,500 / 5,000 = 30%
      const ratio = calculateAffordabilityRatio(1500, 60000)
      expect(ratio).toBe(30)
    })

    it('should handle different income levels', () => {
      // $3,200 rent / $60,000 annual salary ($5,000/month) = 64%
      const ratio = calculateAffordabilityRatio(3200, 60000)
      expect(ratio).toBe(64)
    })

    it('should round to nearest whole number', () => {
      // $1,234 rent / $60,000 salary = 24.68% should round to 25%
      const ratio = calculateAffordabilityRatio(1234, 60000)
      expect(ratio).toBe(25)
    })

    it('should handle very low rent', () => {
      const ratio = calculateAffordabilityRatio(500, 60000)
      expect(ratio).toBe(10)
    })

    it('should handle very high rent', () => {
      const ratio = calculateAffordabilityRatio(5000, 60000)
      expect(ratio).toBe(100)
    })
  })

  describe('getAffordabilityStatus', () => {
    it('should return "Affordable" for 30% or less', () => {
      // Example: $1,400 rent / $60,000 = 28%
      const status = getAffordabilityStatus(1400, 60000)
      expect(status).toBe('Affordable')
    })

    it('should return "Affordable" at exactly 30%', () => {
      const status = getAffordabilityStatus(1500, 60000) // 30%
      expect(status).toBe('Affordable')
    })

    it('should return "Stretch" for 30% to 40%', () => {
      // Example: $1,800 rent / $60,000 = 36%
      const status = getAffordabilityStatus(1800, 60000)
      expect(status).toBe('Stretch')
    })

    it('should return "Stretch" at exactly 40%', () => {
      const status = getAffordabilityStatus(2000, 60000) // 40%
      expect(status).toBe('Stretch')
    })

    it('should return "Not Recommended" for above 40%', () => {
      // San Francisco example: $3,200 rent / $60,000 = 55%
      const status = getAffordabilityStatus(3200, 60000)
      expect(status).toBe('Not Recommended')
    })

    it('should handle boundary between Affordable and Stretch', () => {
      const affordable = getAffordabilityStatus(1500, 60000) // exactly 30%
      const stretch = getAffordabilityStatus(1501, 60000) // 30% + tiny bit
      expect(affordable).toBe('Affordable')
      expect(stretch).toBe('Stretch')
    })

    it('should handle boundary between Stretch and Not Recommended', () => {
      const stretch = getAffordabilityStatus(2000, 60000) // exactly 40%
      const notRec = getAffordabilityStatus(2001, 60000) // 40% + tiny bit
      expect(stretch).toBe('Stretch')
      expect(notRec).toBe('Not Recommended')
    })
  })

  describe('Real-world examples from UI preview', () => {
    it('Sacramento should be Stretch (33% of income)', () => {
      const status = getAffordabilityStatus(1650, 60000)
      const ratio = calculateAffordabilityRatio(1650, 60000)
      expect(status).toBe('Stretch')
      expect(ratio).toBe(33)
    })

    it('Oakland should be Not Recommended (50% of income)', () => {
      const status = getAffordabilityStatus(2500, 60000)
      const ratio = calculateAffordabilityRatio(2500, 60000)
      expect(status).toBe('Not Recommended')
      expect(ratio).toBe(50)
    })

    it('San Francisco should be Not Recommended (64% of income)', () => {
      const status = getAffordabilityStatus(3200, 60000)
      const ratio = calculateAffordabilityRatio(3200, 60000)
      expect(status).toBe('Not Recommended')
      expect(ratio).toBe(64)
    })
  })
})
