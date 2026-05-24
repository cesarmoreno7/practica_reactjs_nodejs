# Security Policy

## Reporting

If you discover a security issue in this project, please contact the maintainer
with a clear description and reproduction steps.

## Known Issues and Exceptions

The following advisory is currently accepted because it is dev-only and has no
available fix:

- GHSA-73rr-hh4g-fpgx (diff < 8.0.3)
  - Path: @cucumber/cucumber -> assertion-error-formatter -> diff
  - Impact: Denial of Service in parsePatch/applyPatch
  - Scope: Development dependencies only (test tooling)
  - Status: No fix available
  - Mitigation: Use only in local/CI test runs; not shipped in production
