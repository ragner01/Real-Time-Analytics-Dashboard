# Real-Time Analytics Dashboard

A comprehensive, interactive business intelligence dashboard with live data visualization, custom report generation, and predictive analytics capabilities.

## 🚀 Features

### Core Dashboard
- **Real-time Metrics Monitoring**: Live updates with SignalR WebSocket communication
- **Interactive Widgets**: Drag-and-drop dashboard customization with react-grid-layout
- **Multiple Chart Types**: Line, Bar, Doughnut, and Area charts using Chart.js
- **Responsive Design**: Modern UI built with Tailwind CSS

### Analytics & Reporting
- **Custom Report Builder**: Create reports with filters, aggregations, and multiple chart types
- **Export Capabilities**: Export data in JSON and CSV formats
- **Advanced Filtering**: Filter by category, status, time range, and custom criteria
- **Data Aggregation**: Support for sum, average, min, max, and count operations

### Predictive Analytics
- **Multiple ML Models**: Linear Regression, Exponential Growth, Moving Average, and Trend Analysis
- **Forecast Generation**: Predict future values with confidence intervals
- **Model Accuracy Metrics**: Built-in accuracy calculation and validation
- **Customizable Parameters**: Adjustable forecasting periods and model parameters

### Data Management
- **MongoDB Integration**: Scalable NoSQL database backend
- **Real-time Updates**: Live data synchronization across all connected clients
- **Sample Data Generation**: Comprehensive demo data for testing and demonstration
- **Data Retention Policies**: Configurable data lifecycle management

## 🛠️ Tech Stack

### Backend
- **ASP.NET Core 8**: High-performance web framework
- **MongoDB**: NoSQL database with MongoDB.Driver
- **SignalR**: Real-time WebSocket communication
- **Swagger/OpenAPI**: API documentation and testing

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe JavaScript development
- **Chart.js**: Professional charting library with react-chartjs-2
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Server state management and caching
- **React Router**: Client-side routing

### Development Tools
- **PowerShell Scripts**: Automated setup and deployment
- **Hot Reload**: Fast development iteration
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting

## 📋 Prerequisites

- **.NET 8 SDK**: [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Node.js 18+**: [Download here](https://nodejs.org/)
- **MongoDB**: [Download here](https://www.mongodb.com/try/download/community)
- **PowerShell 7+**: For Windows automation scripts

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/real-time-analytics-dashboard.git
cd real-time-analytics-dashboard
```

### 2. Automated Setup (Windows)
```powershell
# Run the setup script
.\setup.ps1
```

### 3. Manual Setup

#### Backend Setup
```bash
# Navigate to project root
cd "Real-Time Analytics Dashboard"

# Restore dependencies
dotnet restore

# Run the application
dotnet run
```

#### Frontend Setup
```bash
# Navigate to ClientApp directory
cd ClientApp

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Access the Application
- **Backend API**: http://localhost:5089
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:5089/swagger

## 📊 Dashboard Features

### Metrics Dashboard
- Real-time metric monitoring
- Status-based alerts (Normal, Warning, Critical)
- Trend analysis and change percentage tracking
- Category-based filtering and grouping

### Reports Dashboard
- Custom report builder with drag-and-drop interface
- Multiple chart types and visualization options
- Advanced filtering and data aggregation
- Export functionality (JSON, CSV)

### Predictive Analytics
- Machine learning model selection
- Forecast generation with confidence intervals
- Model accuracy metrics and validation
- Customizable prediction parameters

### Settings & Configuration
- User preferences and theme customization
- Data source management
- Notification settings
- System configuration options

## 🔧 Configuration

### Environment Variables
```bash
# Backend (.env or appsettings.json)
MongoDB__ConnectionString=mongodb://localhost:27017
MongoDB__DatabaseName=AnalyticsDashboard
REACT_APP_API_URL=http://localhost:5089/api

# Frontend (ClientApp/.env)
REACT_APP_API_URL=http://localhost:5089/api
REACT_APP_SIGNALR_URL=http://localhost:5089/analyticsHub
```

### MongoDB Setup
```bash
# Start MongoDB service
mongod --dbpath /path/to/data/db

# Create database and collections
use AnalyticsDashboard
db.createCollection("metrics")
db.createCollection("dashboards")
db.createCollection("reports")
db.createCollection("predictions")
```

## 📁 Project Structure

```
Real-Time Analytics Dashboard/
├── Controllers/           # API endpoints
├── Hubs/                 # SignalR real-time communication
├── Models/               # Data models and DTOs
├── Services/             # Business logic and data access
├── ClientApp/            # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React contexts (Auth, SignalR)
│   │   ├── pages/        # Main application pages
│   │   ├── services/     # API service layer
│   │   └── types/        # TypeScript type definitions
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── Properties/           # .NET project properties
├── Program.cs            # Application entry point
├── setup.ps1            # PowerShell setup script
└── README.md            # This file
```

## 🧪 Testing

### Backend Testing
```bash
# Run unit tests
dotnet test

# Run integration tests
dotnet test --filter Category=Integration
```

### Frontend Testing
```bash
cd ClientApp

# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run E2E tests (if configured)
npm run test:e2e
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker
docker build -t analytics-dashboard .
docker run -p 8080:80 analytics-dashboard
```

### Azure Deployment
```bash
# Deploy to Azure App Service
az webapp up --name your-app-name --resource-group your-rg --runtime "DOTNETCORE:8.0"
```

### GitHub Actions (CI/CD)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Azure
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'your-app-name'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Write unit tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/real-time-analytics-dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/real-time-analytics-dashboard/discussions)
- **Wiki**: [Project Wiki](https://github.com/yourusername/real-time-analytics-dashboard/wiki)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core dashboard functionality
- ✅ Real-time metrics monitoring
- ✅ Basic reporting capabilities
- ✅ Predictive analytics foundation

### Phase 2 (Next)
- 🔄 Advanced ML models
- 🔄 Custom dashboard templates
- 🔄 User authentication and roles
- 🔄 Advanced data visualization

### Phase 3 (Future)
- 📋 Multi-tenant architecture
- 📋 Advanced analytics engine
- 📋 Mobile application
- 📋 API marketplace

## 🙏 Acknowledgments

- **Chart.js** for excellent charting capabilities
- **Tailwind CSS** for the utility-first CSS framework
- **React Team** for the amazing React framework
- **Microsoft** for .NET Core and SignalR
- **MongoDB** for the scalable NoSQL database

---

**Made with ❤️ for the developer community**

*Star this repository if you find it helpful!*
