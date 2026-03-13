const mysql = require('mysql2/promise');

async function testOfficerComplaints() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'complaint_system'
  });

  try {
    console.log('\n=== Testing Officer Complaints Setup ===\n');

    // Test 1: Check officer categories
    console.log('Test 1: Check officer category assignments');
    const [categories] = await connection.execute(`
      SELECT oc.*, u.name as officer_name
      FROM officer_categories oc
      JOIN users u ON oc.officer_id = u.id
      WHERE oc.is_active = TRUE
      ORDER BY u.name
    `);
    
    if (categories.length === 0) {
      console.log('⚠️  No officer categories found. Please assign categories to officers.');
      console.log('   Run: INSERT INTO officer_categories (officer_id, category, is_active) VALUES (?, ?, TRUE)');
    } else {
      console.log(`✓ Found ${categories.length} officer category assignments:\n`);
      categories.forEach(cat => {
        console.log(`  Officer: ${cat.officer_name} (ID: ${cat.officer_id}) → ${cat.category}`);
      });
    }

    // Test 2: Check submitted complaints
    console.log('\n\nTest 2: Check submitted complaints by category');
    const [complaints] = await connection.execute(`
      SELECT c.id, c.title, c.category, c.status, u.name as citizen_name
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      WHERE c.status = 'submitted'
      ORDER BY c.created_at DESC
      LIMIT 10
    `);

    if (complaints.length === 0) {
      console.log('⚠️  No submitted complaints found.');
    } else {
      console.log(`✓ Found ${complaints.length} submitted complaints:\n`);
      complaints.forEach(comp => {
        console.log(`  ID: ${comp.id} | ${comp.title.substring(0, 40)} | Category: ${comp.category} | Citizen: ${comp.citizen_name}`);
      });
    }

    // Test 3: Check notifications
    console.log('\n\nTest 3: Check category notifications');
    const [notifications] = await connection.execute(`
      SELECT cn.*, c.title, u.name as officer_name
      FROM category_notifications cn
      JOIN complaints c ON cn.complaint_id = c.id
      JOIN users u ON cn.officer_id = u.id
      ORDER BY cn.created_at DESC
      LIMIT 10
    `);

    if (notifications.length === 0) {
      console.log('⚠️  No notifications found. This is normal if no complaints have been submitted yet.');
    } else {
      console.log(`✓ Found ${notifications.length} notifications:\n`);
      notifications.forEach(notif => {
        const status = notif.is_read ? '✓ Read' : '✗ Unread';
        console.log(`  Officer: ${notif.officer_name} | Complaint: ${notif.title.substring(0, 30)} | ${status}`);
      });
    }

    // Test 4: Simulate officer viewing complaints
    console.log('\n\nTest 4: Simulate officer viewing complaints');
    if (categories.length > 0 && complaints.length > 0) {
      const officer = categories[0];
      const complaint = complaints.find(c => c.category === officer.category);
      
      if (complaint) {
        console.log(`✓ Officer "${officer.officer_name}" should see complaint: "${complaint.title}"`);
        console.log(`  Category match: ${officer.category} = ${complaint.category}`);
      } else {
        console.log(`⚠️  No complaints found in category "${officer.category}"`);
      }
    }

    // Test 5: Check database tables exist
    console.log('\n\nTest 5: Verify database tables exist');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'complaint_system' 
      AND TABLE_NAME IN ('officer_categories', 'category_notifications')
    `);

    if (tables.length === 2) {
      console.log('✓ Both required tables exist:');
      tables.forEach(t => console.log(`  - ${t.TABLE_NAME}`));
    } else {
      console.log('✗ Missing tables. Please run migrations:');
      console.log('  - database/add_officer_categories_table.sql');
      console.log('  - database/add_category_notifications_table.sql');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

testOfficerComplaints();
