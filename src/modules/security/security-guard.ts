export class SecurityGuard {
  private static readonly INJECTION_PATTERNS = [
    /ignore (?:all )?(?:previous|above) instructions/i,
    /disregard (?:all )?(?:prior|previous) prompts/i,
    /reveal (?:your )?(?:system prompt|secret keys|api keys)/i,
    /you are now (?:dan|unrestricted|jailbreak)/i,
    /system override/i,
    /print all environment variables/i,
  ];

  /**
   * Enforces strict multi-tenant row-level data isolation
   */
  static verifyTenantAccess(requestTenantId: string, resourceTenantId: string, resourceName: string = 'Resource'): void {
    if (!requestTenantId || !resourceTenantId) {
      throw new Error(`Security Error: Missing tenant authentication context.`);
    }

    if (requestTenantId !== resourceTenantId) {
      throw new Error(
        `403 Forbidden: Tenant ${requestTenantId} attempted unauthorized cross-tenant access to ${resourceName} owned by ${resourceTenantId}.`
      );
    }
  }

  /**
   * Scans text for malicious prompt injection attempts
   */
  static scanPromptInjection(text: string): { isClean: boolean; detectedThreat?: string } {
    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        return {
          isClean: false,
          detectedThreat: `Potential prompt injection attack detected matching pattern: ${pattern.source}`,
        };
      }
    }
    return { isClean: true };
  }

  /**
   * Sanitizes untrusted user input before injecting into RAG or Agent prompts
   */
  static sanitizeForPrompt(text: string): string {
    const scan = this.scanPromptInjection(text);
    if (!scan.isClean) {
      throw new Error(`Security Shield Blocked Request: ${scan.detectedThreat}`);
    }

    // Neutralize prompt delimiters
    return text
      .replace(/```/g, "'''")
      .replace(/<system>/gi, '&lt;system&gt;')
      .replace(/<\/system>/gi, '&lt;/system&gt;')
      .trim();
  }
}
