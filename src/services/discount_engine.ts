import { PRICE_TABLE, MONTHLY_DISCOUNT_CAP } from "../config/prices";
import { Shipment, MonthlyStats } from "../domain/types";
import { formatMoney } from "../utils/money";
import { DiscountRule, RuleContext } from "../rules/discount_rule";
import { ThirdFreeRule } from "../rules/third_free_rule";
import { LowestPriceRule } from "../rules/lowest_price_rule";

export class DiscountEngine {
  private readonly rules: DiscountRule[];
  private readonly statsByMonth = new Map<string, MonthlyStats>();

  constructor() {
    // Order matters if new rule is added which mutate monthStats.
    // For a larger project these could be injected, but for the scope of this assignment chose simplicity. 
    this.rules = [new ThirdFreeRule(), new LowestPriceRule()];
  }

  processShipment(shipment: Shipment): string {
    const monthStats = this.getMonthlyStats(shipment.monthKey);
    const basePrice = PRICE_TABLE[shipment.provider][shipment.size];

    const ctx: RuleContext = { shipment, basePrice, monthStats };

    let proposedDiscount = 0;
    for (const rule of this.rules) {
      const result = rule.apply(ctx);
      proposedDiscount += result.discount;
    }

    // Never discount more than the base price
    if (proposedDiscount > basePrice) proposedDiscount = basePrice;

    // Apply monthly cap centrally
    const remainingCap = MONTHLY_DISCOUNT_CAP - monthStats.totalDiscount;
    let actualDiscount = proposedDiscount;

    if (remainingCap <= 0) {
      actualDiscount = 0;
    } else if (actualDiscount > remainingCap) {
      actualDiscount = remainingCap;
    }

    const finalPrice = basePrice - actualDiscount;
    monthStats.totalDiscount += actualDiscount;

    const priceStr = formatMoney(finalPrice);
    const discountStr =
      actualDiscount > 0 ? formatMoney(actualDiscount) : "-";

    return `${shipment.date} ${shipment.size} ${shipment.provider} ${priceStr} ${discountStr}`;
  }

  private getMonthlyStats(monthKey: string): MonthlyStats {
    let stats = this.statsByMonth.get(monthKey);
    if (!stats) {
      stats = { totalDiscount: 0, lpLCount: 0, thirdLFreeUsed: false };
      this.statsByMonth.set(monthKey, stats);
    }
    return stats;
  }
}
