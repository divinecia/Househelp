#!/bin/bash

# Database initialization script for HouseHelp application
# This script should be run when setting up the application for the first time

echo "🚀 Starting HouseHelp database initialization..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Check if Supabase credentials are configured
if [ "$SUPABASE_URL" = "https://xucshfhaxdobksylsbay.supabase.co" ] || [ "$SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Y3NoZmhheGRvYmtzeWxzYmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMTc3MzYsImV4cCI6MjA3ODY5MzczNn0.mr6kfmJ-bq3zhv2_8cjQ4tsOFM2ic5on1oIVfN6H9g8" ]; then
    echo "⚠️  Warning: You are using default Supabase credentials."
    echo "   Please update your .env file with your actual Supabase project credentials."
fi

echo "📊 Applying database schema..."

# Apply the seed SQL file
cat supabase/seed.sql | npx supabase db execute

if [ $? -eq 0 ]; then
    echo "✅ Database initialization completed successfully!"
    echo ""
    echo "🎉 Your HouseHelp application database is now ready!"
    echo "   You can now start the application with: npm run dev"
else
    echo "❌ Database initialization failed. Please check your Supabase configuration."
    exit 1
fi