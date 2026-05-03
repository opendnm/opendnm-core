# Open Domain Name Manager

> ⚠️ **Work in Progress** — This project is under active development. APIs and features may change without notice.

A self-hosted domain portfolio management platform built for domain investors, developers, and enterprises. Automate DNS configuration, Cloudflare zone management, SSL monitoring, and domain marketplace operations from a single dashboard.

---

## ✨ Features

- **CF Pipeline Automation** — Add domains to Cloudflare and update registrar nameservers in a single automated workflow
- **DNS Management** — Create, update, and delete DNS records across all your domains
- **SSL Monitoring** — Track certificate status and get notified before expiration
- **Domain Marketplace** — Configure sale pages, set pricing, and manage buyer inquiries
- **Multi-Registrar Support** — Namecheap, GoDaddy, Dynadot, and more via API
- **Bulk Operations** — Select and act on hundreds of domains at once
- **Dark Mode** — Full light/dark theme support

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Router v7, Tailwind CSS, shadcn/ui |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| Infrastructure | Docker, Docker Compose |

---

## ⚙️ Configuration

### Connecting External APIs

After logging in, go to **Settings → API & Integrations** to connect your providers:

| Provider | Required Fields | Purpose |
|---|---|---|
| Cloudflare | API Token | Zone management, DNS, SSL, Pipeline |
| Namecheap | API Key + Username | NS updates for Namecheap domains |
| GoDaddy | API Key + Secret | NS updates for GoDaddy domains |
| Dynadot | API Key | NS updates for Dynadot domains |

> **Cloudflare must be connected first** — it is required for pipeline automation and DNS management.

### Generating a Cloudflare API Token

1. Go to [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use the **Edit zone DNS** template
4. Set **Zone Resources** to _All zones_
5. Copy the token and paste it into Settings

---

## 📁 Project Structure

```
opendnm-core/
├── apps/
│   ├── web/             # React Router v7 frontend
│   └── api/             # Python FastAPI backend
├── docker-compose.yml   # Development
├── docker-compose.prod.yml  # Production
├── .env.example         # Environment variable template
└── README.md
```

---

## 🛠️ Development Setup

### Frontend

```bash
cd apps/web
pnpm install
pnpm dev
```

### Backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Full stack with Docker

```bash
docker compose up
```

Frontend: `http://localhost:3000`  
Backend API: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`

---

## 🗺️ Roadmap

- [x] Dashboard with portfolio overview
- [x] Domain list with bulk operations
- [x] DNS record management
- [x] Cloudflare pipeline automation
- [x] Marketplace listings configuration
- [x] Multi-provider API key management
- [ ] Python FastAPI backend
- [ ] PostgreSQL schema & migrations
- [ ] Authentication system
- [ ] Orders & quotes management
- [ ] Email notifications
- [ ] Docker production setup
- [ ] Domain expiry auto-renewal alerts

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](LICENSE) file for details.

Under GPLv3, you are free to use, modify, and distribute this software, but any derivative work must also be released under GPLv3 with source code made available.

---

## 🙏 Acknowledgements

- [Cloudflare API](https://developers.cloudflare.com/api/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/)
- [FastAPI](https://fastapi.tiangolo.com/)