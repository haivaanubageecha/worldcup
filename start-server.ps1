$Port = 4173
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

$MimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".svg" = "image/svg+xml"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
}

$Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $Port)
$Listener.Start()

Write-Host "World Cup Predictor is running at http://localhost:$Port/"
Write-Host "Keep this window open while you use the site. Press Ctrl+C to stop."

while ($true) {
  $Client = $Listener.AcceptTcpClient()
  try {
    $Client.ReceiveTimeout = 2000
    $Client.SendTimeout = 2000
    $Stream = $Client.GetStream()
    $Reader = [System.IO.StreamReader]::new($Stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
    $RequestLine = $Reader.ReadLine()

    while ($true) {
      $HeaderLine = $Reader.ReadLine()
      if ([string]::IsNullOrEmpty($HeaderLine)) {
        break
      }
    }

    $Path = "index.html"
    if ($RequestLine -match "GET\s+([^\s?]+)") {
      $Path = [Uri]::UnescapeDataString($Matches[1].TrimStart("/"))
      if ([string]::IsNullOrWhiteSpace($Path)) {
        $Path = "index.html"
      }
    }

    $FilePath = Join-Path $Root $Path
    $ResolvedRoot = [System.IO.Path]::GetFullPath($Root)
    $ResolvedFile = [System.IO.Path]::GetFullPath($FilePath)
    $Status = "200 OK"

    if (-not $ResolvedFile.StartsWith($ResolvedRoot) -or -not (Test-Path -LiteralPath $ResolvedFile -PathType Leaf)) {
      $Status = "404 Not Found"
      $Body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      $ContentType = "text/plain; charset=utf-8"
    } else {
      $Body = [System.IO.File]::ReadAllBytes($ResolvedFile)
      $Extension = [System.IO.Path]::GetExtension($ResolvedFile).ToLowerInvariant()
      $ContentType = $MimeTypes[$Extension]
      if (-not $ContentType) {
        $ContentType = "application/octet-stream"
      }
    }

    $Header = "HTTP/1.1 $Status`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n"
    $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
    $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
    $Stream.Write($Body, 0, $Body.Length)
  } finally {
    $Client.Close()
  }
}
