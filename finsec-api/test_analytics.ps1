Write-Host "FinSec API Analytics Testing Script" -ForegroundColor Cyan
Write-Host "============================="

# Login and get access token
Write-Host "`nLogging in as test user..." -ForegroundColor Cyan
$loginData = @{
    email = 'john.doe@example.com'
    password = 'password123'
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -Body $loginData -ContentType 'application/json'
$token = $loginResponse.access_token

if ($token) {
    Write-Host "Login successful! Received access token." -ForegroundColor Green
    
    # Test each period
    $periods = @('week', 'month', 'year')
    
    foreach ($period in $periods) {
        Write-Host "`nTesting analytics for period: $period" -ForegroundColor Cyan
        
        $analyticsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/analytics/spending?period=$period" -Method Get -Headers @{Authorization = "Bearer $token"} -ContentType 'application/json'
        
        # Display total spending
        $totalSpending = ($analyticsResponse.categories | Measure-Object -Property amount -Sum).Sum
        Write-Host "Total spending for $period period: `$$totalSpending" -ForegroundColor Yellow
        
        # Display spending by category
        Write-Host "Spending breakdown by category:" -ForegroundColor Yellow
        $analyticsResponse.categories | 
            Sort-Object -Property amount -Descending | 
            ForEach-Object {
                Write-Host "  $($_.name): `$$($_.amount) ($($_.percentage)%) - $($_.transactions) transactions, $($_.monthlyChange)% change" -ForegroundColor White
            }
    }
} else {
    Write-Host "Login failed or no access token received." -ForegroundColor Red
}

Write-Host "`nTesting Complete!" -ForegroundColor Cyan 