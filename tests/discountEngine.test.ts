
import { DiscountEngine } from "../src/services/discount_engine";
import { Shipment } from "../src/domain/types";

describe("DiscountEngine", () => {
  it("computes correct discount for simple S shipment MR", () => {
    const engine = new DiscountEngine();
    const shipment: Shipment = {
      date: "2015-02-01",
      monthKey: "2015-02",
      provider: "MR",
      size: "S",
    };

    const line = engine.processShipment(shipment);
    // S MR should be priced as cheapest S (1.50)
    // base: 2.00; discount: 0.50
    expect(line).toBe("2015-02-01 S MR 1.50 0.50");
  });

  it("gives 3rd L/LP free and respects sample flow", () => {
    const engine = new DiscountEngine();

    const shipments: Shipment[] = [
      { date: "2015-02-03", monthKey: "2015-02", size: "L", provider: "LP" },
      { date: "2015-02-06", monthKey: "2015-02", size: "L", provider: "LP" },
      { date: "2015-02-09", monthKey: "2015-02", size: "L", provider: "LP" },
    ];

    const outputs = shipments.map((s) => engine.processShipment(s));

    expect(outputs[0]).toBe("2015-02-03 L LP 6.90 -"); // first L/LP
    expect(outputs[1]).toBe("2015-02-06 L LP 6.90 -"); // second L/LP
    expect(outputs[2]).toBe("2015-02-09 L LP 0.00 6.90"); // third is free
  });

  it("respects monthly discount cap of 10€", () => {
    const engine = new DiscountEngine();

    // We'll try to consume more than 10€ of discounts with S MR (0.50 each)
    const shipments: Shipment[] = [];
    for (let i = 1; i <= 30; i++) {
      shipments.push({
        date: `2015-02-${String(i).padStart(2, "0")}`,
        monthKey: "2015-02",
        size: "S",
        provider: "MR",
      });
    }

    const outputs = shipments.map((s) => engine.processShipment(s));

    // Up to the point where total discount hits 10€ (1000 cents), we see 0.50.
    // After that, discount should be "-".
    let totalDiscount = 0;
    for (const line of outputs) {
      const parts = line.split(" ");
      const discountText = parts[4];
      if (discountText !== "-") {
        const val = parseFloat(discountText.replace(",", "."));
        totalDiscount += Math.round(val * 100);
      }
    }

    expect(totalDiscount).toBe(1000); // 10€
  });
});
