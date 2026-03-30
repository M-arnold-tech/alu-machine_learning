# 🌱 AgriSmart Backend Documentation

Welcome to the AgriSmart API documentation. This guide is designed to help the frontend team understand the API structure, authentication, and core functionality needed to build the AgriSmart web and mobile applications.

---

## 🚀 Getting Started

### Base URL
The API is versioned and follows RESTful principles.
- **Local Development**: `http://localhost:3000/api/v1`
- **Frontend Development (Vite)**: `http://localhost:5173` (Add to CORS)
- **Frontend Development (Next.js)**: `http://localhost:3001` (Add to CORS)
- **Swagger UI**: `http://localhost:3000/api/docs` (Interactive testing)

### Content-Type
All requests should include:
- `Content-Type: application/json`
- `Accept-Language: en` (Optional, supports `rw` for Kinyarwanda)

---

## 🔐 Authentication & Roles

AgriSmart uses **JWT (JSON Web Tokens)** for authentication.

### Authorization Header
For all protected endpoints, include the token in the header:
```http
Authorization: Bearer <your_jwt_token>
```

### User Roles
| Role | Permissions |
| :--- | :--- |
| `ADMIN` | Platform management, advisor approval, global stats. |
| `ADVISOR` | Manage assigned farmers, upload resources, create crop tasks. |
| `FARMER` | Personal dashboard, join groups, message advisors, view weather/prices. |

---

## 📦 Standard Response Format

All API responses are wrapped in a standard structure for consistency.

### Success Response (200 OK / 201 Created)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "timestamp": "2026-03-29T14:50:00.000Z"
}
```

### Error Response (4xx / 5xx)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized",
  "timestamp": "2026-03-29T14:50:00.000Z"
}
```

---

## 🛠 Core Modules

### 1. Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register Farmer/Advisor/Admin. | No |
| `POST` | `/auth/login` | Login and get JWT. | No |
| `GET` | `/auth/me` | Get current user's profile. | Yes |

**Registration Payload Example:**
```json
{
  "email": "farmer@example.com",
  "password": "StrongPassword123",
  "firstName": "Jean",
  "lastName": "Rukundo",
  "role": "FARMER",
  "district": "Musanze",
  "crops": ["Maize", "Irish Potatoes"]
}
```

### 2. Farmer Dashboard (`/farmer`)
| Method | Endpoint | Description | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/farmer/my-stats` | Summary of land, crops, and advisors. | `FARMER` |
| `GET` | `/farmer/my-advisor` | Details of the assigned advisor. | `FARMER` |
| `PUT` | `/farmer/profile` | Update farm details (land size, location). | `FARMER` |

### 3. Advisor Management (`/advisor`)
| Method | Endpoint | Description | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/advisor/stats` | Advisor-specific performance stats. | `ADVISOR` |
| `GET` | `/advisor/assigned-farmers` | List of farmers assigned to you. | `ADVISOR` |
| `POST`| `/advisor/assign-farmer/:id`| Self-assign a farmer for guidance. | `ADVISOR` |

### 4. Real-Time Chat (`/chat`)
Supports both REST API and WebSockets.

#### REST Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/chat/conversations` | **Expert Feature**: Get aggregated list of all private and group chats with latest messages. |
| `GET` | `/chat/history/:userId` | Get 1-on-1 chat history. |
| `GET` | `/chat/group/:groupId` | Get group/cooperative chat history (Paginated). |
| `POST`| `/chat/send` | Send message (REST fallback). |

#### WebSockets (`ws://localhost:3000/chat`)
**Events (Client to Server):**
- `joinRoom`: `{ "roomId": "group_id_or_user_id" }`
- `sendMessage`: `{ "content": "Hello", "receiverId": "ID", "groupId": "ID" }`
- `typing`: `{ "roomId": "ID", "isTyping": true }`

**Events (Server to Client):**
- `receiveMessage`: Object containing sender, content, and timestamp.
- `userTyping`: `{ "userId": "ID", "isTyping": true }`

---

## 🌾 Agricultural Resources

### Groups & Cooperatives (`/groups`)
- `GET /groups`: List all groups with `memberCount` and `isMember` flags.
- `GET /groups/:id`: Get detailed group info including `admin` and `members`.
- `POST /groups/create`: Create a new group (Creator is automatically added as a member).
- `POST /groups/:id/join`: Join a cooperative.

### Knowledge Base (`/knowledge-base`)
- `GET /knowledge-base`: List resources (PDFs, Images, Guides).
- `POST /knowledge-base/upload`: Upload new resource (Admin/Advisor only).

### Weather & Market Prices
- `GET /weather/:district`: Live weather and recommendations for a district.
- `GET /market-prices`: Real-time crop prices across Rwanda.

---

## 🛡 Admin Only (`/admin`)
- `GET /admin/stats`: Global platform analytics.
- `GET /admin/advisors/pending`: List advisors awaiting verification.
- `PATCH /admin/approve-advisor/:id`: Verify an advisor account.
- `DELETE /admin/users/:id`: Deactivate any account.

---

## 💡 Pro-Tips for Frontend

> [!TIP]
> **Dynamic Districts**: Use `GET /weather` to get a list of supported Rwandan districts to populate dropdowns during registration and profile setup.

> [!IMPORTANT]
> **Error Handling**: Always check `success: false` in responses even for 2xx codes if using custom interceptions, though standard HTTP codes are followed.
