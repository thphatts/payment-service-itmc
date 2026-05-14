param (
    [string]$studentId = "N23DCCN204",
    [int]$amount = 50000
)

$data = @{
    orderCode = (Get-Date).Ticks % 1000000
    amount = $amount
    description = "QUYCLB $studentId CAMP01"
    accountNumber = "123456789"
    reference = "TEST-REF-$(Get-Random)"
    transactionDateTime = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    currency = "VND"
    paymentLinkId = "LINK-$(Get-Random)"
}

# In a real scenario, we'd sign this. For testing, I'll add a bypass header or just mock the call.
# Actually, let's create a "debug" endpoint in the backend for this.

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/webhooks/payos" -Method Post -Body (ConvertTo-Json @{
    code = "00"
    desc = "Success"
    data = $data
    signature = "DEBUG_BYPASS" # We'll update the backend to allow this in dev
}) -ContentType "application/json"
