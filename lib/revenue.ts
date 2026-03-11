// backend simulation for tracking accumulated revenue (USD)

let totalRevenueAccumulated = 0

export function addRevenue(amountUSD: number) {
  totalRevenueAccumulated += amountUSD
  // in a real backend this would persist to a database
  console.log("[revenue] totalRevenueAccumulated =", totalRevenueAccumulated)
}

export function getTotalRevenue() {
  return totalRevenueAccumulated
}
