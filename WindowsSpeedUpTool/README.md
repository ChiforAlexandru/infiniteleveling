# Windows Speed Up Tool

This small PowerShell utility creates a desktop launcher with one-click buttons for common Windows performance actions and system tools.

## Files

- `WindowsSpeedUpTool.ps1` – the main app
- `buttons.json` – list of actions and menu buttons
- `Launch-SpeedUp-Tool.bat` – quick launcher

## How to run

1. Open a PowerShell terminal.
2. Run:

```powershell
.\WindowsSpeedUpTool.ps1
```

Or double-click:

```bat
Launch-SpeedUp-Tool.bat
```

## How to customize

Edit `buttons.json` and add or remove buttons.

Example button entries:

```json
{
  "name": "Task Manager",
  "type": "menu",
  "file": "taskmgr.exe"
}
```

```json
{
  "name": "Disable Hibernation",
  "type": "command",
  "command": "powercfg /h off",
  "requiresAdmin": true
}
```

## Suggested uses

- Open system tools in one click
- Launch performance and maintenance pages
- Run cleanup commands without searching the Start menu
- Save time on repeated tasks
- Test system settings in a safe VM before trying on the host machine

## Recommended safe testing in Hyper-V

Yes — this is a good candidate to test inside a Hyper-V virtual machine first.

Best practice:

1. Create a checkpoint/snapshot before running any admin-level actions.
2. Use the VM for menu-openers and non-destructive cleanup actions first.
3. Avoid running risky commands on your main machine until you are comfortable with the behavior.
4. Keep this tool in a VM for experimentation, then apply only the safe actions later on the host.

Example safe actions to test in the VM:

- Task Manager
- Startup Apps
- Services
- Resource Monitor
- Disk Cleanup
- Temp Folder
- Clear Temp Folder

Example actions that should be used with extra caution:

- Disable Hibernation
- Power Saver Mode
- Startup delay changes
- Any command that affects system services or low-level performance

## Notes

Some commands may require administrator rights. The app will prompt for elevation automatically when needed.
