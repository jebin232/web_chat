# Chat Pro 

A feature-rich, real-time chat application built with **Node.js**, **Express**, and **WebSockets**. This project features a modern, WhatsApp-inspired dark UI with support for image sharing, voice notes, message management, and live typing indicators.

## 🚀 Features

* **Real-time Messaging:** Instant delivery using WebSockets.
* **Media Support:**
    * 📷 **Image Uploads:** Drag & drop or file picker support.
    * 🎤 **Voice Notes:** Built-in audio recorder and player.
* **Message Actions:**
    * **Reply:** Quote messages for context.
    * **Edit:** Fix typos in sent messages.
    * **Delete for Everyone:** Remove messages for all connected users.
* **Live Status:**
    * **Typing Indicators:** See who is typing in real-time.
    * **Online Count:** Live counter of active participants.
    * **System Alerts:** Notifications when users join or leave.
* **Modern UI:**
    * Dark Mode / WhatsApp-style theme.
    * Custom context menu (Right-click/Dropdown).
    * Emoji picker.
    * Responsive design for mobile and desktop.

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Real-time:** `ws` (WebSocket library)
* **File Handling:** `multer` (for image/audio uploads)
* **Frontend:** Vanilla HTML5, CSS3, JavaScript (No framework required)

## 📦 Installation

1.  **Clone the repository** (or create your project folder):
    ```bash
    mkdir chat-pro-ultra
    cd chat-pro-ultra
    ```

2.  **Initialize the project:**
    ```bash
    npm init -y
    ```

3.  **Install dependencies:**
    ```bash
    npm install express ws multer
    ```

4.  **Verify File Structure:**
    Ensure your project looks like this:
    ```
    chat-pro-ultra/
    ├── public/
    │   ├── index.html       # The main frontend file
    │   └── uploads/         # Created automatically for media files
    ├── server.js            # The Node.js server
    ├── package.json
    └── README.md
    ```

## 🏃‍♂️ Running the App

1.  **Start the server:**
    ```bash
    node server.js
    ```
    *(You should see: `Server running at http://localhost:3000`)*

2.  **Open in Browser:**
    * Go to `http://localhost:3000`
    * Open the same URL in a second tab (or an Incognito window) to test chatting between two users.

## 🔌 API & Socket Events

The application communicates via JSON payloads over WebSockets.

| Event Type | Description |
| :--- | :--- |
| `join` | Sent when a user connects (includes username). |
| `message` | Standard text or media message payload. |
| `typing` | Broadcasts that a user has started typing. |
| `stopTyping`| Broadcasts that a user stopped typing. |
| `delete` | Triggers removal of a specific message ID for all users. |
| `edit` | Updates the text content of a specific message ID. |
| `count` | Updates the "Online Participants" counter in the header. |

## 🎨 UI Controls

* **Send Message:** Press `Enter` or click the ➤ button.
* **Send Voice Note:** Click the 🎤 button (requires microphone permission).
* **Context Menu:** Hover over a message and click the small arrow (`⌵`) to Reply, Edit, or Delete.
* **Attach Image:** Click the 📎 icon.

## 📝 Notes

* **Storage:** Images and audio are stored locally in `public/uploads`.
* **Persistence:** This demo uses in-memory storage for active sessions. If you restart the server, the chat history resets (though uploaded files remain in the folder).

## 📄 License

This project is open-source and free to use.
