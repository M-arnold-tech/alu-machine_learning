# 💬 AgriSmart Chat Implementation Guide

This guide provides the frontend team with the technical details required to implement the real-time chat feature in the AgriSmart application. It covers REST APIs for message history and WebSockets for real-time interaction.

---

## 🏗 Architecture Overview

The AgriSmart chat system supports two types of conversations:
1.  **PRIVATE**: One-on-one messaging between two users (e.g., Farmer and Advisor).
2.  **GROUP**: Multi-user messaging within cooperatives or regional clusters.

---

## 📂 1. The Conversations List (Sidebar/Inbox)

Use this endpoint to build the list of active chats for the current user.

### `GET /chat/conversations`
Returns an aggregated list of all private and group chats the user is involved in, sorted by the latest activity.

**Response Structure (`data` array):**
```json
{
  "id": "uuid",
  "type": "GROUP" | "PRIVATE",
  "name": "Group Name" | "Partner Name",
  "lastMessage": {
    "content": "Hello world",
    "createdAt": "2026-03-29T14:50:00.000Z",
    "senderId": "uuid"
  },
  "unreadCount": 0
}
```

---

## 🔍 1.5 Global User Discovery (New Chat)

To allow users to find and start conversations with any other available user in the AgriSmart system, use the global search endpoint.

### `GET /chat/users/search`
Returns a list of available users matching an optional search query, returning safe public profile chunks (excluding the current user).

**Query Parameters:**
- `q` (optional): String to filter users by `firstName`, `lastName`, or `email`.

**Response Structure (`data` array):**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@example.com",
  "role": "FARMER" | "ADVISOR" | "ADMIN",
  "avatarUrl": "https://..." | null
}
```
*Frontend Tip: Create a "New Chat" button that opens a modal with this search endpoint. When a user is selected, use `POST /chat/send` with `receiverId` set to their ID to start the conversation.*

---

## 📜 2. Message History

When a user clicks on a conversation, fetch the history using these endpoints.

### Private Chat History
`GET /chat/history/:partnerUserId`

### Group Chat History (Paginated)
`GET /chat/group/:groupId?limit=50&offset=0`

> [!TIP]
> **Pagination**: Group history returns the most recent messages first. Use `offset` to load older messages as the user scrolls up.

---

## ⚡ 3. Real-Time WebSockets

For live updates, connect to the Chat Namespace.

### Connection
- **URL**: `ws://localhost:3000/chat`
- **Auth**: Ensure your JWT is provided if required (usually via handshake query or auth object).

### Client side Events (Emit)

| Event | Payload | Description |
| :--- | :--- | :--- |
| `joinRoom` | `{ "roomId": "ID" }` | Join a Group ID or User ID room to receive messages. |
| `leaveRoom` | `{ "roomId": "ID" }` | Stop receiving updates for a room. |
| `sendMessage`| `{ "content": "text", "receiverId": "ID", "groupId": "ID" }` | Send a live message. |
| `typing` | `{ "roomId": "ID", "userId": "ID", "isTyping": true }` | Notify others that you are typing. |

### Server side Events (Listen)

| Event | Payload | Description |
| :--- | :--- | :--- |
| `receiveMessage`| `Message Object` | Incoming message for the joined room. |
| `userTyping` | `{ "userId": "ID", "isTyping": true }` | Update UI to show "User is typing...". |
| `joinedRoom` | `{ "roomId": "ID" }` | Confirmation of room entry. |

---

## 🛠 4. Data Models

### Message Object
```json
{
  "id": "uuid",
  "content": "Message text",
  "senderId": "uuid",
  "receiverId": "uuid" | null,
  "groupId": "uuid" | null,
  "type": "TEXT" | "IMAGE" | "FILE",
  "createdAt": "ISO-8601 String",
  "sender": {
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "..."
  }
}
```

---

## 💡 Implementation Tips

1.  **Optimistic Updates**: When a user sends a message via `sendMessage`, add it to the UI immediately with a "sending" state before receiving the server confirmation.
2.  **XSS Protection**: The backend sanitizes HTML tags (e.g., `<` becomes `&lt;`), so the frontend should safely render text content.
3.  **Room Strategy**: In group chats, always `joinRoom` using the `groupId`. In private chats, use the `partnerUserId` or a unique shared room ID if provided.
4.  **Audio Notifications**: Play a subtle sound on `receiveMessage` if the window is not focused.

---

> [!IMPORTANT]
> **Base URL**: All REST calls should go to `http://localhost:3000/api/v1/chat`.
> **Authorization**: Include `Bearer <token>` in all REST requests.
