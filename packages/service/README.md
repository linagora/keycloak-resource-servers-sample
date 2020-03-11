# Service

Expose a REST API on http://localhost:3001:

- /service: User must be authenticated
- /service/good: User must be authenticated and have the role `good-role` in the realm
- /service/bad: User must have the role `bad-role` in the realm. Since this role is not defined, will sends back HTTP 403 error