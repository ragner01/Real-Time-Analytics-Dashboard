# Real-Time Analytics Dashboard Setup Script
# This script helps set up the development environment

Write-Host "🚀 Real-Time Analytics Dashboard Setup" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if .NET 8 is installed
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow
try {
    $dotnetVersion = dotnet --version
    if ($dotnetVersion -like "8.*") {
        Write-Host "✅ .NET 8 SDK found: $dotnetVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ .NET 8 SDK not found. Please install .NET 8 SDK from https://dotnet.microsoft.com/download" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ .NET SDK not found. Please install .NET 8 SDK from https://dotnet.microsoft.com/download" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔧 Setting up backend..." -ForegroundColor Yellow

# Restore backend dependencies
Write-Host "Restoring .NET dependencies..." -ForegroundColor Cyan
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to restore .NET dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Backend dependencies restored" -ForegroundColor Green

Write-Host "`n🎨 Setting up frontend..." -ForegroundColor Yellow

# Navigate to client app and install dependencies
if (Test-Path "ClientApp") {
    Set-Location "ClientApp"
    
    Write-Host "Installing npm dependencies..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install npm dependencies" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    
    # Go back to root
    Set-Location ".."
} else {
    Write-Host "❌ ClientApp directory not found" -ForegroundColor Red
    exit 1
}

Write-Host "`n📝 Configuration..." -ForegroundColor Yellow

# Check if MongoDB connection string is configured
$appsettingsContent = Get-Content "appsettings.json" -Raw
if ($appsettingsContent -match '"ConnectionString":\s*"mongodb://localhost:27017"') {
    Write-Host "⚠️  MongoDB connection string is set to localhost" -ForegroundColor Yellow
    Write-Host "   Make sure MongoDB is running locally or update the connection string in appsettings.json" -ForegroundColor Yellow
} else {
    Write-Host "✅ MongoDB connection string configured" -ForegroundColor Green
}

Write-Host "`n🚀 Setup complete!" -ForegroundColor Green
Write-Host "`nTo run the application:" -ForegroundColor Cyan
Write-Host "1. Start MongoDB (if using local instance)" -ForegroundColor White
Write-Host "2. Run backend: dotnet run" -ForegroundColor White
Write-Host "3. Run frontend: cd ClientApp; npm start" -ForegroundColor White
Write-Host "`nBackend will be available at: https://localhost:7001" -ForegroundColor White
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor White
Write-Host "API Documentation: https://localhost:7001/swagger" -ForegroundColor White

Write-Host "`n📚 For more information, see README.md" -ForegroundColor Cyan
