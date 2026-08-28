AI Career Path Engine

AI Career Path Engine is a full-stack application designed to help users explore and plan career paths using AI-powered guidance. The project combines a Python backend, a web frontend, MongoDB Atlas for persistent data, and configurable LLM providers.

Project status: Active development / foundation setup

Tech Stack

Backend

Python 3.12

FastAPI / Python application backend

Motor (motor.motor_asyncio) for asynchronous MongoDB access

python-dotenv for environment configuration

MongoDB Atlas

Frontend

JavaScript/TypeScript web frontend

Source code located under frontend/src

Reusable UI components under frontend/src/components

Application pages under frontend/src/pages

AI / LLM

The backend is configured to support a primary LLM provider and a fallback provider through environment variables.

Current configuration supports:

Sarvam AI as a primary provider

OpenAI as a fallback provider

The exact models and AI workflow will be documented as the project implementation is finalized.

Project Structure

pathengine/
├── backend/
│   ├── app/                  # Backend application
│   ├── config.py             # Application/configuration settings
│   ├── db.py                 # MongoDB/database integration
│   ├── test_connection.py   # MongoDB connection test
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variable template
│   └── .env                  # Local secrets - DO NOT COMMIT
│
├── frontend/
│   └── src/
│       ├── components/       # Reusable frontend components
│       └── pages/            # Application pages
│
├── data/                     # Local/project data
├── .gitignore
└── README.md

Prerequisites

Install the following before running the project:

Python 3.12+

Node.js and npm

Git

A MongoDB Atlas account

API credentials for the configured AI providers

Backend Setup

1. Clone the repository

git clone https://github.com/avaleajay170/pathengine.git
cd pathengine

2. Create and activate a virtual environment

Windows:

cd backend
python -m venv venv
venv\Scripts\activate

3. Install Python dependencies

pip install -r requirements.txt

4. Configure environment variables

Create:

backend/.env

Use backend/.env.example as the template.

Example:

MONGODB_URI=mongodb+srv://<database-user>:<database-password>@<cluster-host>/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB_NAME=trajectory

LLM_PROVIDER=sarvam
LLM_API_KEY=<your-sarvam-api-key>
LLM_FALLBACK_PROVIDER=openai
LLM_FALLBACK_API_KEY=<your-openai-api-key>

Never commit backend/.env or any file containing API keys, passwords, or other secrets.

MongoDB Atlas

The project uses MongoDB Atlas as its database service.

The development configuration currently uses:

Atlas Free Tier (M0)

AWS Mumbai region (ap-south-1)

Asynchronous MongoDB access through Motor

To verify the database connection:

cd backend
python test_connection.py

A successful connection should print:

Connected to MongoDB Atlas successfully!
Using database: <database-name>

Frontend Setup

From the project root:

cd frontend
npm install

Start the frontend using the development script defined in frontend/package.json:

npm run dev

If the frontend uses a different script, use the corresponding command from package.json.

Environment and Security

The following files/directories should remain local and must not be pushed to GitHub:

.env
.env.*
venv/
.venv/
__pycache__/
node_modules/

An example environment file should contain variable names and safe placeholder values only.

Development Workflow

A typical development workflow is:

Start MongoDB Atlas.

Configure backend/.env.

Activate the Python virtual environment.

Start the backend application.

Start the frontend development server.

Test the MongoDB connection before debugging application-level database features.

Keep secrets out of Git.

Roadmap

The project documentation and implementation roadmap will be expanded to cover:

Core product workflow

Career-path recommendation logic

AI/LLM orchestration

User data and database schema

API endpoints

Frontend user flows

Authentication and authorization

Error handling and validation

Testing

Deployment

Future enhancements

Contributing

Create a feature branch.

Make focused changes.

Test the backend and frontend locally.

Do not commit secrets or generated environments.

Commit with a clear message.

Push the branch and open a pull request.

License

License information will be added when the project license is finalized.