import { LowestPriceRule } from "../src/rules/lowest_price_rule";
import { ThirdFreeRule } from "../src/rules/third_free_rule";
import { RuleContext } from "../src/rules/discount_rule";
import { MonthlyStats, Shipment } from "../src/domain/types";
import { PRICE_TABLE } from "../src/config/prices";

function makeStats(): MonthlyStats {
  return { totalDiscount: 0, lpLCount: 0, thirdLFreeUsed: false };
}

describe("LowestSPriceRule", () => {
  it("applies discount for S shipments when provider is not cheapest", () => {
    const rule = new LowestPriceRule();

    const shipment: Shipment = {
      date: "2015-02-01",
      monthKey: "2015-02",
      provider: "MR", // S MR -> 2.00, cheapest S is 1.50
      size: "S",
    };

    const ctx: RuleContext = {
      shipment,
      basePrice: PRICE_TABLE.MR.S, // 200
      monthStats: makeStats(),
    };

    const result = rule.apply(ctx);
    expect(result.discount).toBe(50); // 2.00 - 1.50 = 0.50 => 50 cents
  });

  it("does not apply discount for non-S shipments", () => {
    const rule = new LowestPriceRule();
    const shipment: Shipment = {
      date: "2015-02-01",
      monthKey: "2015-02",
      provider: "MR",
      size: "M",
    };

    const ctx: RuleContext = {
      shipment,
      basePrice: PRICE_TABLE.MR.M,
      monthStats: makeStats(),
    };

    const result = rule.apply(ctx);
    expect(result.discount).toBe(0);
  });
});

describe("ThirdLFreeRule", () => {
  it("makes 3rd L/LP free in a month", () => {
    const rule = new ThirdFreeRule();
    const stats = makeStats();

    const shipmentTemplate: Omit<Shipment, "date"> = {
      monthKey: "2015-02",
      provider: "LP",
      size: "L",
    };

    const ctx1: RuleContext = {
      shipment: { ...shipmentTemplate, date: "2015-02-01" },
      basePrice: PRICE_TABLE.LP.L,
      monthStats: stats,
    };
    const ctx2: RuleContext = {
      shipment: { ...shipmentTemplate, date: "2015-02-02" },
      basePrice: PRICE_TABLE.LP.L,
      monthStats: stats,
    };
    const ctx3: RuleContext = {
      shipment: { ...shipmentTemplate, date: "2015-02-03" },
      basePrice: PRICE_TABLE.LP.L,
      monthStats: stats,
    };

    const r1 = rule.apply(ctx1);
    const r2 = rule.apply(ctx2);
    const r3 = rule.apply(ctx3);

    expect(r1.discount).toBe(0);
    expect(r2.discount).toBe(0);
    expect(r3.discount).toBe(PRICE_TABLE.LP.L); // full price discount on 3rd
    expect(stats.lpLCount).toBe(3);
    expect(stats.thirdLFreeUsed).toBe(true);
  });

  it("does not apply more than once per month", () => {
    const rule = new ThirdFreeRule();
    const stats = makeStats();

    // First, use up the third-free rule:
    for (let i = 1; i <= 3; i++) {
      const ctx: RuleContext = {
        shipment: {
          date: `2015-02-0${i}`,
          monthKey: "2015-02",
          provider: "LP",
          size: "L",
        },
        basePrice: PRICE_TABLE.LP.L,
        monthStats: stats,
      };
      rule.apply(ctx);
    }

    // Fourth L/LP in the same month
    const ctx4: RuleContext = {
      shipment: {
        date: "2015-02-10",
        monthKey: "2015-02",
        provider: "LP",
        size: "L",
      },
      basePrice: PRICE_TABLE.LP.L,
      monthStats: stats,
    };

    const r4 = rule.apply(ctx4);
    expect(r4.discount).toBe(0);
  });
});
