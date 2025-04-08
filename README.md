# Campus Guide Backend

Backend server for the Campus Guide application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a .env file with:
```plaintext
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
HUGGINGFACE_TOKEN=your_huggingface_token
```

3. Run the server:
```bash
npm start
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/assistant` - AI assistant endpoint