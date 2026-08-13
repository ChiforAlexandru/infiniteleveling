[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null
[System.Reflection.Assembly]::LoadWithPartialName('System.Drawing') | Out-Null

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$configPath = Join-Path $scriptDir 'buttons.json'

if (-not (Test-Path $configPath)) {
    [System.Windows.Forms.MessageBox]::Show("Missing config file: $configPath", 'Windows Speed Up Tool', 'OK', 'Error')
    exit 1
}

try {
    $config = Get-Content -Path $configPath -Raw | ConvertFrom-Json
}
catch {
    [System.Windows.Forms.MessageBox]::Show("Could not read buttons.json. Please check the JSON format.", 'Windows Speed Up Tool', 'OK', 'Error')
    exit 1
}

function Invoke-ToolAction {
    param(
        [Parameter(Mandatory = $true)]
        $Action
    )

    if ($Action.type -eq 'menu') {
        $target = $Action.file
        if ([string]::IsNullOrWhiteSpace($target)) {
            [System.Windows.Forms.MessageBox]::Show('This menu item has no target configured.', 'Windows Speed Up Tool', 'OK', 'Warning')
            return
        }

        try {
            if (-not [string]::IsNullOrWhiteSpace($Action.arguments)) {
                Start-Process -FilePath $target -ArgumentList $Action.arguments | Out-Null
            }
            else {
                Start-Process -FilePath $target | Out-Null
            }
        }
        catch {
            [System.Windows.Forms.MessageBox]::Show("Could not open: $target`n`n$($_.Exception.Message)", 'Windows Speed Up Tool', 'OK', 'Error')
        }

        return
    }

    if ($Action.type -eq 'command') {
        $commandText = $Action.command
        if ([string]::IsNullOrWhiteSpace($commandText)) {
            [System.Windows.Forms.MessageBox]::Show('This action has no command configured.', 'Windows Speed Up Tool', 'OK', 'Warning')
            return
        }

        if ($Action.requiresAdmin -and -not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)) {
            try {
                Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $commandText) | Out-Null
            }
            catch {
                [System.Windows.Forms.MessageBox]::Show("Administrator rights are required for this action.`n`n$($_.Exception.Message)", 'Windows Speed Up Tool', 'OK', 'Warning')
            }
            return
        }

        try {
            Invoke-Expression $commandText
        }
        catch {
            [System.Windows.Forms.MessageBox]::Show("Command failed:`n$commandText`n`n$($_.Exception.Message)", 'Windows Speed Up Tool', 'OK', 'Error')
        }

        return
    }

    [System.Windows.Forms.MessageBox]::Show("Unknown action type: $($Action.type)", 'Windows Speed Up Tool', 'OK', 'Error')
}

$form = New-Object System.Windows.Forms.Form
$form.Text = if ($config.title) { $config.title } else { 'Windows Speed Up Tool' }
$form.Size = New-Object System.Drawing.Size(860, 540)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedSingle'
$form.MaximizeBox = $false
$form.MinimizeBox = $true
$form.BackColor = [System.Drawing.Color]::FromArgb(18, 26, 35)

$header = New-Object System.Windows.Forms.Label
$header.Text = 'One-click Windows performance shortcuts'
$header.Font = New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Bold)
$header.ForeColor = [System.Drawing.Color]::White
$header.AutoSize = $true
$header.Location = New-Object System.Drawing.Point(20, 20)
$form.Controls.Add($header)

$subtitle = New-Object System.Windows.Forms.Label
$subtitle.Text = 'Open system tools or run common cleanup and performance actions.'
$subtitle.Font = New-Object System.Drawing.Font('Segoe UI', 10)
$subtitle.ForeColor = [System.Drawing.Color]::LightGray
$subtitle.AutoSize = $true
$subtitle.Location = New-Object System.Drawing.Point(22, 58)
$form.Controls.Add($subtitle)

$panel = New-Object System.Windows.Forms.FlowLayoutPanel
$panel.Location = New-Object System.Drawing.Point(20, 90)
$panel.Size = New-Object System.Drawing.Size(800, 380)
$panel.FlowDirection = 'LeftToRight'
$panel.WrapContents = $true
$panel.AutoScroll = $true
$panel.BackColor = [System.Drawing.Color]::FromArgb(22, 31, 45)
$form.Controls.Add($panel)

foreach ($action in $config.buttons) {
    $btn = New-Object System.Windows.Forms.Button
    $btn.Text = $action.name
    $btn.Tag = $action
    $btn.Width = 220
    $btn.Height = 60
    $btn.Font = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
    $btn.BackColor = [System.Drawing.Color]::FromArgb(39, 174, 96)
    $btn.ForeColor = [System.Drawing.Color]::White
    $btn.FlatStyle = 'Flat'
    $btn.Margin = New-Object System.Windows.Forms.Padding(8, 8, 8, 8)
    $btn.Add_Click({
        param($sender, $eventArgs)
        Invoke-ToolAction -Action $sender.Tag
    })
    $panel.Controls.Add($btn)
}

$closeButton = New-Object System.Windows.Forms.Button
$closeButton.Text = 'Close'
$closeButton.Width = 120
$closeButton.Height = 38
$closeButton.Font = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
$closeButton.BackColor = [System.Drawing.Color]::FromArgb(220, 53, 69)
$closeButton.ForeColor = [System.Drawing.Color]::White
$closeButton.FlatStyle = 'Flat'
$closeButton.Location = New-Object System.Drawing.Point(710, 470)
$closeButton.Add_Click({ $form.Close() })
$form.Controls.Add($closeButton)

$form.Add_Shown({ $form.Activate() })
[void] $form.ShowDialog()
