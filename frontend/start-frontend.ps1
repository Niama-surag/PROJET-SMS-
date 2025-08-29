# SMS Campaign Platform Frontend Setup
# Run this script to install dependencies and start the frontend

Write-Host "🚀 Setting up SMS Campaign Platform Frontend" -ForegroundColor Green
Write-Host "=" * 50

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🎯 Starting development server..." -ForegroundColor Yellow
    Write-Host "📍 Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "📍 Backend API should be running at: http://localhost:8000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔧 Make sure your backend API is running before using the frontend!" -ForegroundColor Red
    Write-Host ""
    
    # Start the development server
    npm start
} else {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    Write-Host "Please check the error messages above and try again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Available Features:" -ForegroundColor Green
Write-Host "• 📊 Dashboard with analytics" -ForegroundColor White
Write-Host "• 👥 Contact Management with import/export" -ForegroundColor White
Write-Host "• 📱 SMS Campaign Creation & Management" -ForegroundColor White
Write-Host "• 📈 Advanced Analytics & Reports" -ForegroundColor White
Write-Host "• ⚙️ Settings & User Management" -ForegroundColor White
