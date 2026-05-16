# Changelog

## [0.0.1] - 2026-05-16
### Added
- Initial project structure with Spring Boot and React.
- PayOS integration for payment link generation.
- Webhook signature verification for security.
- Redis-based idempotency for webhook processing.
- Docker support with `Dockerfile` and `docker-compose.yml`.
- Comprehensive documentation folder.

### Fixed
- Dependency version override issue for Gson.
- Wrong package import in `OrderController`.
- Thymeleaf namespace typo in HTML templates.
- Potential order code collision by using full timestamp.
