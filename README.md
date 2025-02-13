# FTPaste

FTPaste is an open-source, self-hosted pastebin alternative. Built with ASP.NET Core, React, and PostgreSQL, it aims to provide a simple and secure way to share text snippets, code, and logs.

## Features
- Create and share pastes with unique URLs
- Retrieve raw paste content for CLI usage
- Delete pastes using a secure token
- Syntax highlighting (coming soon)
- Expiring pastes (coming soon)

## Tech Stack
- Backend: ASP.NET Core
- Database: PostgreSQL
- Frontend: React + Next js

## Getting Started
### Prerequisites
- .NET 8 SDK (or latest LTS version)
- Node.js + npm
- Docker (optional, for containerized setup)

### Clone the Repository
```bash
git clone https://github.com/frederic11/ftpaste.git
cd ftpaste
```

### Backend Setup
```bash
cd src/Backend/FTPaste.Api
dotnet run
```

### Frontend Setup
```bash
cd src/Frontend/ftpaste-web
npm install
npm run dev
```

## API Endpoints (MVP)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pastes` | Create a new paste |
| GET | `/api/pastes/{pasteId}` | Retrieve a paste |
| DELETE | `/api/pastes/{pasteId}` | Delete a paste |
| GET | `/api/pastes/{pasteId}/raw` | Retrieve raw paste content |

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.

## Roadmap
- Syntax highlighting
- Paste expiration
- Password-protected pastes
- Statistics and view counts

---

Happy Pasting!

