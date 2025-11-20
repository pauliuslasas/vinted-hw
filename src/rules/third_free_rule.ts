import { DiscountRule, RuleContext, RuleResult } from "./discount_rule";

export class ThirdFreeRule implements DiscountRule {
  apply(ctx: RuleContext): RuleResult {
    const { shipment, basePrice, monthStats } = ctx;

    if (shipment.provider !== "LP" || shipment.size !== "L") {
      return { discount: 0 };
    }

    monthStats.lpLCount += 1;

    if (!monthStats.thirdLFreeUsed && monthStats.lpLCount === 3) {
      monthStats.thirdLFreeUsed = true;
      return { discount: basePrice };
    }

    return { discount: 0 };
  }
}
