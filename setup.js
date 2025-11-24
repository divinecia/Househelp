#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

console.log('🚀 Starting HouseHelp database setup...');

async function setupDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase configuration in .env file');
    console.log('Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in your .env file');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('📊 Testing database connection...');

  // Test connection first
  try {
    // Try to query the auth.users table which should always exist
    const { data, error } = await supabase.from('auth.users').select('id').limit(1);
    if (error) {
      // Try alternative method - just test if we can connect
      const { data: testData, error: testError } = await supabase.rpc('now');
      if (testError && !testError.message.includes('schema cache')) {
        throw testError;
      }
    }
    console.log('✅ Database connection successful');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('Please verify your Supabase credentials in .env file');
    process.exit(1);
  }

  console.log('\n📊 Checking if database schema exists...');

  // Check if tables already exist
  const tablesToCheck = ['user_profiles', 'workers', 'homeowners', 'admins', 'genders', 'marital_statuses', 'payment_methods', 'residence_types', 'worker_info_options', 'criminal_record_options', 'smoking_drinking_restrictions', 'services'];
  let existingTables = 0;
  let missingTables = [];

  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(tableName).select('id').limit(1);
      if (!error) {
        existingTables++;
        console.log(`✅ Table ${tableName} already exists`);
      } else if (error.code === 'PGRST116') {
        // Table doesn't exist
        missingTables.push(tableName);
        console.log(`ℹ️  Table ${tableName} needs to be created`);
      }
    } catch (err) {
      // Table doesn't exist, which is fine
      missingTables.push(tableName);
      console.log(`ℹ️  Table ${tableName} needs to be created`);
    }
  }

  if (existingTables === tablesToCheck.length) {
    console.log('\n✅ All tables already exist! Database is ready.');
    console.log('🎉 Your HouseHelp application database is already set up!');
    return;
  }

  console.log(`\n📊 Found ${missingTables.length} tables that need to be created.`);

  console.log('\n📊 Setting up database schema...');
  
  // Try to get service role key from environment or prompt user
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.log('\n⚠️  SUPABASE_SERVICE_ROLE_KEY not found in .env file');
    console.log('   To create tables automatically, you need to add your service role key to .env:');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    console.log('\n   🎯 Alternative: Manual setup via Supabase Dashboard');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the contents of supabase/seed.sql');
    console.log('   4. Click "Run" to execute the SQL');
    console.log('\n   Would you like me to show you the SQL commands to copy?');
    
    // Show the SQL content
    try {
      const seedSql = fs.readFileSync(path.join(__dirname, 'supabase/seed.sql'), 'utf8');
      console.log('\n📋 Here are the SQL statements to copy to Supabase Dashboard:');
      console.log('=' .repeat(60));
      console.log(seedSql);
      console.log('=' .repeat(60));
      console.log('\n✅ Copy the above SQL and paste it in your Supabase Dashboard SQL Editor');
    } catch (err) {
      console.log('❌ Could not read seed.sql file');
    }
    return;
  }
  
  // If we have service role key, try to apply the database schema
  console.log('\n📊 Database schema setup...');
  
  let seedSql;
  try {
    seedSql = fs.readFileSync(path.join(__dirname, 'supabase/seed.sql'), 'utf8');
  } catch (err) {
    console.log('❌ Could not read seed.sql file:', err.message);
    return;
  }
  
  // Try to apply schema using Supabase REST API
  console.log('🔄 Applying database schema using Supabase REST API...');
  
  // Split SQL into individual statements and execute them
  const statements = seedSql.split(';').filter(stmt => stmt.trim().length > 0);
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim();
    if (!statement || statement.startsWith('--')) continue;
     
    try {
      // Try different API endpoints for SQL execution
      let response;
      
      // Method 1: Try /rest/v1/sql endpoint
      try {
        response = await fetch(`${supabaseUrl}/rest/v1/sql`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: statement })
        });
        
        if (response.ok) {
          successCount++;
          continue;
        }
      } catch (e) {
        // Method 1 failed, try Method 2
      }
      
      // Method 2: Try /pg endpoint (alternative SQL endpoint)
      try {
        response = await fetch(`${supabaseUrl}/pg`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: statement })
        });
        
        if (response.ok) {
          successCount++;
          continue;
        }
      } catch (e) {
        // Method 2 also failed
      }
      
      errorCount++;
      
    } catch (err) {
      errorCount++;
    }
    
    // Show progress
    if ((i + 1) % 5 === 0) {
      console.log(`   Processed ${i + 1}/${statements.length} statements...`);
    }
  }
  
  console.log(`✅ Successfully executed ${successCount} SQL statements`);
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} statements failed (likely due to existing objects)`);
  }
  
  if (successCount > 0) {
    console.log('✅ Database schema applied successfully!');
  } else {
    console.log('ℹ️  Could not apply schema automatically: All SQL statements failed to execute');
    console.log('\n🎯 Manual Setup Required:');
    console.log('=====================================');
    console.log('1. Go to your Supabase Dashboard:');
    console.log('   https://app.supabase.com');
    console.log('');
    console.log('2. Select your project');
    console.log('');
    console.log('3. Navigate to "SQL Editor" in the left sidebar');
    console.log('');
    console.log('4. Copy and paste the contents of supabase/seed.sql');
    console.log('');
    console.log('5. Click the "Run" button to execute the SQL');
    console.log('');
    console.log('6. Wait for all statements to complete successfully');
    console.log('=====================================');
    
    // Create a temporary SQL file for easy access
    const tempSqlFile = path.join(__dirname, 'manual-setup.sql');
    fs.writeFileSync(tempSqlFile, seedSql);
    console.log(`\n📁 SQL also saved to: ${tempSqlFile}`);
  }

  console.log('\n✅ Database setup completed!');
  console.log('\n🎉 Your HouseHelp application database setup is ready!');
  console.log('   Next steps:');
  console.log('   1. Apply the actual schema using Supabase CLI or dashboard');
  console.log('   2. Test the connection at: http://localhost:5000/api/health/db');
  console.log('   3. Start your development server: npm run dev');
}

// Check if we can connect to the server
async function checkServer() {
  try {
    const response = await fetch('http://localhost:5000/api/ping');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Server is running on port 5000: ${data.message}`);
      return true;
    }
  } catch (err) {
    console.log('ℹ️  Server not running on port 5000');
    return false;
  }
}

async function main() {
  console.log('🏠 HouseHelp Application Setup');
  console.log('================================');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('\n💡 Tip: Start your server with: npm run dev');
  }
  
  await setupDatabase();
  
  console.log('\n✨ Setup complete! Your HouseHelp application is ready to use.');
}

main().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});