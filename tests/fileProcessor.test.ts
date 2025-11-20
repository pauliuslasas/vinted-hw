import { FileProcessor } from "../src/services/file_processor";
import * as fs from "fs";

jest.mock("fs");

describe("FileProcessor", () => {
  it("returns processed lines from input file", () => {
    (fs.readFileSync as jest.Mock).mockReturnValue("2015-02-01 S MR");

    const processor = new FileProcessor();
    const lines = processor.processFile("fake/path.txt");

    expect(lines).toEqual(["2015-02-01 S MR 1.50 0.50"]);
  });
});
