import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";

// A11yテストのため toHaveNoViolations マッチャーをグローバル登録する
// (constitution.md Core Principle XV)。
expect.extend(toHaveNoViolations);
