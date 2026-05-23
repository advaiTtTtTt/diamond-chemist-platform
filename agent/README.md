# Diamond Chemist Print Agent — Setup Guide

## What this does
Runs silently on the shop computer. Automatically 
prints new orders as they arrive. No manual action needed.

## Requirements
- Windows 10/11 PC connected to the printer
- Node.js installed (download from nodejs.org)
- SumatraPDF installed (download from sumatrapdfreader.org)
  Add SumatraPDF to Windows PATH

## Setup (one time only)
1. Copy the agent/ folder to C:\DiamondChemistAgent\
2. Copy .env.example to .env
3. Open .env in Notepad and fill in:
   SUPABASE_URL → from Supabase dashboard
   AGENT_SECRET → from Supabase secrets
   PRINTER_NAME → exact name from Windows Settings 
                  → Bluetooth & devices → Printers
4. Open Command Prompt in the folder
5. Run: npm install
6. Run: node print-agent.js
   You should see: "Diamond Chemist Print Agent running..."

## How to find your exact printer name
Windows key → Settings → Bluetooth & devices → Printers & scanners
Copy the exact name shown (e.g. "HP LaserJet Pro M404dn")
Paste into PRINTER_NAME in .env

## Making it start automatically with Windows
Run install-service.bat as Administrator.
The agent will start silently on every reboot.

## If something goes wrong
Check C:\DiamondChemistAgent\agent.log
The error message will tell you what failed.
