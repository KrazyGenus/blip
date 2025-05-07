# Blip - A Compliance Tool for YouTube Creators

Blip is a proactive compliance tool designed to help YouTube creators ensure their videos adhere to YouTube’s community guidelines before uploading. With features like keyword flagging, inappropriate visual detection, and automatic video adjustments (bleeping and blurring)(yet to be implemented), Blip aims to streamline content moderation for creators. It's my goodbye to ALX_SE Africa.
---

## Features
- **Keyword Flagging**: Automatically identifies and flags inappropriate language in audio.
- **Visual Content Analysis**: Detects inappropriate visuals and overlays blurs where necessary.
- **Real-Time Processing**: Provides a user-friendly interface for reviewing flagged content.
- **Scalable Architecture**: Handles large video files and simultaneous users efficiently.

---

## Prerequisites
Before setting up the project, ensure you have the following:

1. **Node.js** (v16 or later) installed.
2. **Google AI Studio API Key** for AI integrations.
3. **MongoDB Atlas Database Key** for storing flagged timestamps and user data.
4. Redis Server, Bull Queue Requires it.

---

## Setup Instructions

### Step 1: Clone the Repository
```bash
$ git clone https://github.com/BugFixDotExe/blip.git
$ cd blip
```

### Step 2: Obtain API Keys
1. **Google AI Studio API Key**:
   - Visit [Google AI Studio](https://ai.google.com/studio) and create a new project.
   - Enable the necessary APIs (e.g., Speech-to-Text, Vision API).
   - Generate an API key and note it down.

2. **MongoDB Atlas Database Key**:
   - Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a new cluster and get the connection string.
   - Replace `<username>` and `<password>` with your credentials in the connection string.

### Step 3: Configure Environment Variables
Create a `.env` file in both the **frontend** and **backend** directories:

**Backend .env File:**
```env
GOOGLE_API_KEY=your-google-api-key
MONGODB_URI=your-mongodb-connection-string
PORT=5000
```
**JWT Authorization File: **
Your required to create a Asymetric key when working with JWT
this is the approach i took, rather than use Symetric approach
- Generate HSA Private and Public Keys
- Save the Public and Private Keys in files with names:
    - privatekey.pem
    - publickey.pem





### Step 4: Install Dependencies
Navigate to the **frontend** and **backend** directories and install the required dependencies:

**Frontend:**
```bash
$ cd frontend
$ npm install
```

**Backend:**
```bash
$ cd backend
$ npm install
```

### Step 5: Start the Development Servers

**Frontend:**
```bash
$ npm run dev
```

**Backend:**
```bash
$ npm run dev
```

---

## Project Structure
```
blip/
|-- frontend/         # React-based frontend with Material-UI
|   |-- src/
|   |-- public/
|   `-- .env          # Frontend environment variables
|
|-- backend/          # Node.js backend with Express
|   |-- src/
|   `-- .env          # Backend environment variables
|
|-- README.md         # Project documentation
```

---

## Contributing
We welcome contributions! Please fork the repository, create a new branch, and submit a pull request with your changes.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

## Contact
For any questions or feedback, feel free to reach out:
- **Email:** bugfix.exe@gmail.com
- **Email:** krazygenus@gmail.com

- **GitHub Issues:** [Open an Issue](https://github.com/KrazyGenus/blip/issues)

