## Vinted Shipping Discount Calculator

This project calculates the shipment discount rules described in the Vinted homework assignment.
It is written in TypeScript using Node.js, no external runtime libraries are used — only Node’s standard library and Jest for testing. 

# Features
----------------------------
* Reads shipments from input.txt by default in the root (or a provided file path).
* Applies the following rules:
    1. Lowest S Price Rule – All S packages always cost the lowest available S price.
    2. Third L Shipment Free via LP – Once per calendar month, the 3rd L shipment via LP becomes free.
    3. Monthly Discount Cap – Total monthly discounts cannot exceed 10 eur, partial discounts are applied if the cap is nearly reached.
* Prints results to STDOUT.
* Invalid lines are echoed with "Ignored".
* Fully tested:
    1. Parsing tests
    2. Rule unit tests
    3. Engine tests
    4. Full end-to-end test against the sample input

# Code structure
----------------------------
```
src/
├─ index.ts                  # Entry point 
├─ config/
│   └─ prices.ts             # Provider prices, discount cap
├─ domain/
│   ├─ types.ts              # Main types (Shipment, Provider, Size)
│   └─ parsing.ts            # Input line parsing
├─ rules/
│   ├─ discount_rule.ts       # Rule interface + RuleContext
│   ├─ lowest_price_rule.ts
│   └─ third_free_rule.ts
├─ services/
│   ├─ file_processor.ts      # Reads the input file
│   └─ discount_engine.ts     # Applies rules + monthly cap
└─ utils/
    └─ money.ts              # Formatting helpers
```

This structure was chosen for several reasons:
* Separation of rules and engine
* Easy to extend, add new rule, add it to the engine and it works
* Easy to test independently

# Running the code
----------------------------
The project is run on NodeJS, so having Node is a requirement

1. Run `npm install`
2. Run `npm start` it will read the `input.txt` by default from root, alternatively it is posible to provide a path using `npm start -- path/to/myfile.txt`

Done, the project should out put somehting like this:
```
2015-02-01 S MR 1.50 0.50
2015-02-02 S MR 1.50 0.50
```

# Running tests
----------------------------
For testing `jest` library was used, to run **all tests** just type `npm test`.
To run individual tests the easiest way is to install a `Jest runner` extension and then just pren **Run** on top of the test which you want to run.

There are 4 test files:
1. `parsing.test.ts` ensures the input is tested
2. `rules.test.ts` test individual rules
3. `discountEngine.test.ts` tests the combined behavior of rules and monthly cap
4. `fileProcessor.test.ts` tests file input reading
5. `fulFlow.test.ts` end-to-end test with the assignments sample input

# Adding new rules
----------------------------
To add a new rule:
1. Create a new file `src/rules/MyNewRule.ts`
2. Create your new rule class and implement `DiscountRule `
3. Add the new rule in the `DiscountEngine`
    ```
    this.rules = [
    new ThirdLFreeRule(),
    new LowestSPriceRule(),
    new MyNewRule(),
    ];
    ```
4. Add unit tests