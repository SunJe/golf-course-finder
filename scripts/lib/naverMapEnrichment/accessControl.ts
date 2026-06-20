import { TEXT_PATTERNS } from "./selectors";

/** 네이버 차단/과도한 접근 메시지 감지 */
export function isAccessBlockedText(text: string): boolean {
  const combined = text;
  return (
    TEXT_PATTERNS.captcha.test(combined) ||
    TEXT_PATTERNS.loginRequired.test(combined) ||
    TEXT_PATTERNS.accessBlocked.test(combined) ||
    TEXT_PATTERNS.excessiveAccess.test(combined)
  );
}

export function isAccessBlockedNote(note: string, mismatchReason = ""): boolean {
  const combined = `${note} ${mismatchReason}`;
  return (
    isAccessBlockedText(combined) ||
    /circuit_breaker/i.test(combined) ||
    /access blocked|login required|captcha|과도한\s*접근|서비스\s*이용/i.test(
      combined,
    )
  );
}

export class AccessCircuitBreaker {
  tripped = false;
  reason = "";

  trip(reason: string): void {
    if (this.tripped) return;
    this.tripped = true;
    this.reason = reason;
  }
}

export class AccessBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessBlockedError";
  }
}

/** page.goto 호출 간 최소 간격 */
export class GotoRateLimiter {
  private lastGotoAt = 0;

  constructor(private readonly minIntervalMs: number) {}

  async waitBeforeGoto(): Promise<void> {
    if (this.minIntervalMs <= 0) return;
    const elapsed = Date.now() - this.lastGotoAt;
    if (elapsed < this.minIntervalMs) {
      await sleep(this.minIntervalMs - elapsed);
    }
    this.lastGotoAt = Date.now();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function rowGapWithJitter(gapMs: number, jitterMs: number): number {
  if (jitterMs <= 0) return gapMs;
  return gapMs + Math.floor(Math.random() * jitterMs);
}
