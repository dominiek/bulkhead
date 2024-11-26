# Bedrock Platform

More documentation about specific services and components can be found in the following sections:

- [deployment/](deployment/) - Provisioning, Deployment automation, how to's, playbooks and procedures
- [services/api](services/api) - Data API and data model layer that powers all applications
- [services/backup](services/backup) - Backup services for mongo and bucket storage, and monitoring
- [services/web](services/web) - Web application and administration dashboard

## Quick Start

Using Docker Compose you can build and run all services and dependencies as follows:

```bash
docker compose up
```

Open the dashboard at http://localhost:2200/ - Admin login credentials can be seen in the API output.

### API Documentation

Full portal with examples:

http://localhost:2200/docs/getting-started

Code documentation:

[services/api](services/api)

### Web Documentation

[services/web](services/web)
