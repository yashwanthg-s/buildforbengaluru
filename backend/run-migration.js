const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    console.log('📦 Reading migration file...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/add_resolution_images_table.sql'),
      'utf8'
    );
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(`\n🔄 Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);
      
      try {
        await connection.execute(statement);
        console.log(`✓ Success\n`);
      } catch (error) {
        console.error(`✗ Error: ${error.message}\n`);
        throw error;
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Verifying tables...');
    
    // Verify tables exist
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'complaint_resolutions'"
    );
    
    if (tables.length > 0) {
      console.log('✓ complaint_resolutions table exists');
    } else {
      console.log('✗ complaint_resolutions table NOT found');
    }
    
    // Check complaints table columns
    const [columns] = await connection.execute(
      "DESCRIBE complaints"
    );
    
    const hasResolutionId = columns.some(col => col.Field === 'resolution_id');
    const hasResolvedBy = columns.some(col => col.Field === 'resolved_by');
    const hasResolvedAt = columns.some(col => col.Field === 'resolved_at');
    
    console.log(`✓ resolution_id column: ${hasResolutionId ? '✓' : '✗'}`);
    console.log(`✓ resolved_by column: ${hasResolvedBy ? '✓' : '✗'}`);
    console.log(`✓ resolved_at column: ${hasResolvedAt ? '✓' : '✗'}`);
    
    if (hasResolutionId && hasResolvedBy && hasResolvedAt) {
      console.log('\n✅ All columns verified successfully!');
    } else {
      console.log('\n⚠️ Some columns are missing');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

console.log('🚀 Starting migration...\n');
runMigration();
