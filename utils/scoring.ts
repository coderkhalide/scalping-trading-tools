import type { TradingSystem, ScoreData } from "@/types/trading-system"

export const getLetterGrade = (score: number): { grade: string; color: string } => {
  if (score >= 150) return { grade: "A++++", color: "text-purple-700" }
  if (score >= 130) return { grade: "A+++", color: "text-purple-600" }
  if (score >= 110) return { grade: "A++", color: "text-purple-500" }
  if (score >= 95) return { grade: "A+", color: "text-green-600" }
  if (score >= 85) return { grade: "A", color: "text-green-500" }
  if (score >= 75) return { grade: "B", color: "text-blue-500" }
  if (score >= 65) return { grade: "C", color: "text-yellow-500" }
  if (score >= 55) return { grade: "D", color: "text-orange-500" }
  return { grade: "F", color: "text-red-500" }
}

export const getFactorGradeLabel = (grade: number): { label: string; color: string } => {
  if (grade >= 90) return { label: "Perfect", color: "text-purple-600" }
  if (grade >= 75) return { label: "Strong", color: "text-green-600" }
  if (grade >= 50) return { label: "Moderate", color: "text-yellow-600" }
  if (grade >= 25) return { label: "Weak", color: "text-orange-600" }
  return { label: "Poor", color: "text-red-600" }
}

export const calculateScore = (system: TradingSystem): ScoreData => {
  let totalScore = 0
  let totalWeight = 0
  const factorBreakdown: ScoreData["factorBreakdown"] = []

  // Calculate base score
  for (const group of system.factorGroups) {
    let groupScore = 0
    let groupTotalWeight = 0
    let mandatoryMet = true
    const groupFactors: ScoreData["factorBreakdown"][0]["factors"] = []

    // Calculate total weight for normalization
    const totalFactorWeight = group.factors.reduce((sum, f) => sum + f.weight, 0)

    if (group.operator === "AND") {
      // For AND groups, all factors must meet minimum threshold
      let allMeetThreshold = true
      for (const factor of group.factors) {
        const threshold = factor.isMandatory ? 50 : 25
        const meetsThreshold = factor.individualGrade >= threshold

        if (factor.isMandatory && !meetsThreshold) {
          mandatoryMet = false
        }
        if (!meetsThreshold) {
          allMeetThreshold = false
        }

        // Calculate normalized factor contribution
        const normalizedWeight = totalFactorWeight > 0 ? (factor.weight / totalFactorWeight) * 100 : 0
        const factorContribution = meetsThreshold ? (factor.individualGrade / 100) * normalizedWeight : 0

        groupFactors.push({
          factorId: factor.id,
          factorName: factor.name,
          contribution: factorContribution,
          individualGrade: factor.individualGrade,
        })

        groupTotalWeight += factor.weight
      }

      if (allMeetThreshold) {
        // All factors meet threshold, calculate weighted average
        groupScore = group.factors.reduce((sum, factor) => {
          const normalizedWeight = totalFactorWeight > 0 ? (factor.weight / totalFactorWeight) * 100 : 0
          return sum + (factor.individualGrade / 100) * normalizedWeight
        }, 0)
      } else if (!mandatoryMet) {
        groupScore = 0 // Mandatory factors not met
      } else {
        // Partial score for factors that meet threshold
        groupScore = group.factors.reduce((sum, factor) => {
          const threshold = factor.isMandatory ? 50 : 25
          const normalizedWeight = totalFactorWeight > 0 ? (factor.weight / totalFactorWeight) * 100 : 0
          if (factor.individualGrade >= threshold) {
            return sum + (factor.individualGrade / 100) * normalizedWeight
          }
          return sum
        }, 0)
      }
    } else {
      // OR groups - any factor above threshold contributes
      for (const factor of group.factors) {
        const threshold = factor.isMandatory ? 50 : 25
        const meetsThreshold = factor.individualGrade >= threshold

        if (factor.isMandatory && !meetsThreshold) {
          mandatoryMet = false
        }

        const normalizedWeight = totalFactorWeight > 0 ? (factor.weight / totalFactorWeight) * 100 : 0
        const factorContribution = meetsThreshold ? (factor.individualGrade / 100) * normalizedWeight : 0

        groupFactors.push({
          factorId: factor.id,
          factorName: factor.name,
          contribution: factorContribution,
          individualGrade: factor.individualGrade,
        })

        if (meetsThreshold) {
          groupScore += factorContribution
        }
        groupTotalWeight += factor.weight
      }
    }

    if (!mandatoryMet) {
      return {
        baseScore: 0,
        bonusPoints: 0,
        totalScore: 0,
        factorBreakdown: [],
      }
    }

    factorBreakdown.push({
      groupId: group.id,
      groupName: group.name,
      groupScore: Math.min(groupScore, 100), // Cap at 100
      maxGroupScore: 100,
      factors: groupFactors,
    })

    // Apply group weight to normalized group score
    const normalizedGroupScore = (groupScore / 100) * group.weight
    totalScore += normalizedGroupScore
    totalWeight += group.weight
  }

  const baseScore = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0

  // Calculate bonus points
  let bonusPoints = 0
  const allFactors = system.factorGroups.flatMap((g) => g.factors)

  for (const bonusRule of system.bonusRules) {
    if (!bonusRule.isActive) continue

    let ruleMatches = true
    for (const condition of bonusRule.conditions) {
      const matchingFactors = allFactors.filter((f) => f.name === condition.factorName)
      const minimumGrade = condition.minimumGrade || 75

      // Check if all required timeframes for this factor meet the grade requirement
      const requiredTimeframes = condition.timeframes
      const qualifyingTimeframes = matchingFactors
        .filter((f) => f.individualGrade >= minimumGrade)
        .map((f) => f.timeframe)

      const hasAllTimeframes = requiredTimeframes.every((tf) => qualifyingTimeframes.includes(tf))

      if (!hasAllTimeframes) {
        ruleMatches = false
        break
      }
    }

    if (ruleMatches) {
      bonusPoints += bonusRule.bonusPoints
    }
  }

  return {
    baseScore: Math.min(baseScore, 100),
    bonusPoints,
    totalScore: Math.min(baseScore, 100) + bonusPoints,
    factorBreakdown,
  }
}
