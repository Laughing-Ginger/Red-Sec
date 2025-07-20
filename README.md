# Red-Sec
> A <span style="color:#6a3ab2; font-weight:bold;">Sec</span>ure AI-powered <span style="color:#f44336; font-weight:bold;">red</span>action tool.

Red-Sec is a modern, full-stack web application designed to automatically find and redact sensitive information from text. Using a powerful AI model combined with custom user-defined patterns, it helps protect privacy by sanitizing documents before they are shared.

![Red-Sec Live Screenshot](https://raw.githubusercontent.com/Laughing-Ginger/Red-Sec/main/client/src/assets/screen_shot.png)

---

## Features

- **AI-Powered Entity Detection:** Automatically identifies and redacts common sensitive entities like Persons (PER), Organizations (ORG), and Locations (LOC).
- **Custom Pattern Redaction:** Users can provide their own regular expressions to redact specific patterns like emails, phone numbers, or ID codes.
- **Batch File Processing:** Upload multiple `.txt` files to a queue and process them all at once.
- **Real-time Status Updates:** The UI provides real-time feedback on the status of each file in the queue (queued, processing, completed, error).
- **Download All:** Download all successfully redacted files as a batch with a single click.
- **Detailed Statistics:** Provides a summary of the redaction process, including the total number of redactions, processing time, and a breakdown by entity type.
- **Session-Based History:** Keeps a history of your recent redactions, allowing you to view and reload previous results.
- **Modern & Responsive UI:** A sleek, dark-themed, and fully responsive user interface built with React.

---

## Tech Stack

The project is a full-stack MERN application with a separate frontend and backend.

### Frontend

- **React:** A JavaScript library for building user interfaces.
- **Vite:** A frontend tooling for leaner development experience.


### Backend

- **Express:** A web application framework for Node.js.
- **MongoDB:** A NoSQL database used to store redaction history.
- **Hugging Face Inference API:** Utilizes the `dslim/bert-base-NER` model for Named Entity Recognition.

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v14 or later)
- npm
- MongoDB (local installation or a cloud instance like MongoDB Atlas)

### Installation & Setup

1.  **Clone the repository**

2.  **Setup the Backend:**
    - Navigate to the `backend` directory:
      ```sh
      cd backend
      ```
    - Install the required packages:
      ```sh
      npm install
      ```
    - Start the backend server:
      ```sh
      node server.js
      ```
    The server should now be running on `localhost`.

3.  **Setup the Frontend:**
    - Open a new terminal and navigate to the `frontend` directory:
      ```sh
      cd frontend
      ```
    - Install the required packages:
      ```sh
      npm install
      ```
    - Start the React development server:
      ```sh
      npm run dev
      ```
    The application should now be open and running in your browser at `localhost`.

---

## Usage

1.  **Choose an Input Method:** Select either "Paste Text" or "Upload Files".
2.  **Provide Content:** Paste your text into the text area or upload one or more `.txt` files to the queue.
3.  **Select Targets:** Use the toggle switches to select which standard entities (Persons, Orgs, etc.) you want to redact.
4.  **Add Custom Patterns:** (Optional) Enter any comma-separated regular expressions for custom redaction needs.
5.  **Redact:** Click "Redact Content" (for pasted text) or "Process Queue" (for files).
6.  **Review Results:** The redacted text and statistics will appear in the output section. You can then download the result(s) individually or all at once.

