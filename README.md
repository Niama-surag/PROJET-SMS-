# 📱 SMS Campaign Platform

A modern, full-featured SMS Campaign Management Platform with React frontend and FastAPI backend.

## 🚀 Features

### 📊 **Dashboard**
- Real-time analytics and KPIs
- Campaign performance metrics
- Quick action buttons
- Visual charts and graphs

### 👥 **Contact Management**
- Create, edit, and delete contacts
- Import contacts from CSV/Excel files
- Advanced search and filtering
- Contact segmentation by various criteria
- Bulk operations

### 📱 **Campaign Management**
- Create and manage SMS campaigns
- Message personalization with placeholders
- Campaign scheduling
- Campaign preview and testing
- Multiple campaign types (promotional, welcome, reminder, notification)

### 📈 **Analytics & Reports**
- Performance tracking (delivery, open, click rates)
- Regional performance analysis
- Campaign type distribution
- Interactive charts and visualizations

### ⚙️ **Settings & Administration**
- User management with role-based access
- API configuration for SMS providers
- Notification preferences
- System configuration

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Ant Design** - Professional UI components
- **Recharts** - Data visualization
- **Axios** - HTTP client for API calls

### Backend
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - Python ORM
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## 📋 Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- PostgreSQL database
- npm or yarn package manager

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure database connection in database.py
# Update the DATABASE_URL with your PostgreSQL credentials

# Create database tables
python creat-table.py

# Start the backend server
python main_test.py
```

The backend will be available at: `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will be available at: `http://localhost:3000`

## 🔧 Configuration

### Database Configuration
Update the database connection string in `backend/database.py`:
```python
DATABASE_URL = "postgresql://username:password@localhost:5432/database_name"
```

### SMS Provider Configuration
Configure your SMS provider settings in the Settings panel of the application or directly in the backend configuration.

## 📱 API Endpoints

### Health & System
- `GET /` - Health check
- `GET /test` - System test
- `GET /dashboard` - Analytics dashboard

### Contact Management
- `POST /contacts/` - Create contact
- `GET /contacts/` - List all contacts
- `GET /contacts/{contact_id}` - Get specific contact
- `PUT /contacts/{contact_id}` - Update contact
- `DELETE /contacts/{contact_id}` - Delete contact
- `GET /contacts/search/{query}` - Search contacts
- `POST /contacts/segment` - Segment contacts

### Campaign Management
- `POST /campaigns/` - Create campaign
- `GET /campaigns/` - List campaigns
- `GET /campaigns/{campaign_id}` - Get specific campaign
- `PUT /campaigns/{campaign_id}` - Update campaign
- `POST /campaigns/{campaign_id}/preview` - Preview campaign

### Mailing Lists
- `POST /mailing-lists/` - Create mailing list
- `GET /mailing-lists/` - List mailing lists
- `POST /mailing-lists/{list_id}/contacts` - Add contacts to list

## 🎨 UI Components

### Layout
- Responsive sidebar navigation
- Collapsible menu
- Modern card-based design
- Professional color scheme

### Features
- Data tables with sorting and filtering
- Interactive forms with validation
- Modal dialogs for create/edit operations
- Progress indicators and status badges
- Charts and analytics visualizations

## 🔐 Security Features

- Role-based access control
- API key management
- Data validation
- Opt-out compliance
- Secure password handling

## 📊 Analytics Features

- Real-time performance metrics
- Campaign effectiveness tracking
- Regional performance analysis
- Interactive data visualizations
- Export capabilities

## 🚀 Deployment

### Backend Deployment
1. Set up a PostgreSQL database
2. Configure environment variables
3. Deploy using Docker, Heroku, or your preferred platform
4. Run database migrations

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy to Netlify, Vercel, or your preferred static hosting
3. Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

---

**Made with ❤️ for efficient SMS campaign management**
