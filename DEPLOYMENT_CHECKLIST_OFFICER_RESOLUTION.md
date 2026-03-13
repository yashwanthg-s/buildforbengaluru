# Deployment Checklist - Officer Resolution Images

## Pre-Deployment

- [ ] All code changes committed to git
- [ ] Backend code reviewed for syntax errors
- [ ] Frontend code reviewed for syntax errors
- [ ] Database migration file reviewed
- [ ] No console errors in development

## Database Setup

- [ ] MySQL server is running
- [ ] complaint_system database exists
- [ ] Root user has proper permissions
- [ ] Backup database before migration (optional but recommended)

### Run Migration

- [ ] Open `database/add_resolution_images_table.sql`
- [ ] Execute migration in TablePlus/MySQL CLI
- [ ] Verify "Migration completed!" message appears
- [ ] Check new table exists: `SHOW TABLES LIKE 'complaint_resolutions';`
- [ ] Check new columns exist: `DESCRIBE complaints;`

## Backend Deployment

- [ ] Navigate to backend folder: `cd backend`
- [ ] Install dependencies: `npm install` (if needed)
- [ ] Start server: `npm run dev`
- [ ] Verify server starts without errors
- [ ] Check for "listening on port 5000" message
- [ ] Verify `/api/complaints/:id/resolve` endpoint is registered

## Frontend Deployment

- [ ] Navigate to frontend folder: `cd frontend`
- [ ] Install dependencies: `npm install` (if needed)
- [ ] Start dev server: `npm start`
- [ ] Verify frontend loads without errors
- [ ] Check browser console for errors

## Feature Testing

### Officer Dashboard Tests

- [ ] Login as officer (user with officer role)
- [ ] View assigned complaints list
- [ ] Click on a complaint to view details
- [ ] Change status dropdown to "Resolved"
- [ ] Verify "📸 Upload Resolution Images" button appears
- [ ] Click button to enter resolution mode
- [ ] Upload before image (file picker works)
- [ ] Verify before image preview displays
- [ ] Upload after image (file picker works)
- [ ] Verify after image preview displays
- [ ] Add resolution notes in textarea
- [ ] Verify "Submit Resolution" button is enabled
- [ ] Click submit button
- [ ] Verify success message appears
- [ ] Verify complaint status changes to "resolved"
- [ ] Check images saved to `/backend/uploads` directory
- [ ] Verify resolution record created in database

### Citizen History Tests

- [ ] Login as citizen (user who submitted complaint)
- [ ] Navigate to "My Complaint History"
- [ ] View list of complaints
- [ ] Click on a resolved complaint
- [ ] Scroll to "✅ Resolution Proof" section
- [ ] Verify section displays for resolved complaints only
- [ ] Verify before image displays correctly
- [ ] Verify after image displays correctly
- [ ] Verify resolution notes display correctly
- [ ] Verify images are clickable/viewable
- [ ] Test on mobile device (responsive design)

### Database Tests

- [ ] Query resolution records: `SELECT * FROM complaint_resolutions;`
- [ ] Verify officer_id is recorded
- [ ] Verify image paths are correct
- [ ] Verify timestamps are set
- [ ] Check foreign key relationships work
- [ ] Verify cascade delete works (optional test)

### API Tests

- [ ] Test endpoint with curl or Postman
- [ ] Verify request validation (missing images)
- [ ] Verify response format
- [ ] Check error handling
- [ ] Verify images are saved to disk

## Performance Tests

- [ ] Upload large image (test file size limit)
- [ ] Upload multiple resolutions quickly
- [ ] Check database query performance
- [ ] Monitor disk space usage
- [ ] Check memory usage

## Security Tests

- [ ] Verify officer ID is required
- [ ] Verify only officers can resolve
- [ ] Verify image paths are safe
- [ ] Check for SQL injection vulnerabilities
- [ ] Verify file upload validation

## Browser Compatibility

- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on mobile browser

## Error Handling

- [ ] Test with missing before image
- [ ] Test with missing after image
- [ ] Test with invalid officer ID
- [ ] Test with invalid complaint ID
- [ ] Test with network error
- [ ] Verify error messages are user-friendly

## Documentation

- [ ] README updated with new feature
- [ ] API documentation updated
- [ ] User guide created for officers
- [ ] User guide created for citizens
- [ ] Troubleshooting guide created

## Deployment

- [ ] Code merged to main branch
- [ ] Database migration applied to production
- [ ] Backend deployed to production
- [ ] Frontend deployed to production
- [ ] Verify all services are running
- [ ] Monitor logs for errors

## Post-Deployment

- [ ] Monitor system performance
- [ ] Check error logs
- [ ] Verify feature works in production
- [ ] Get user feedback
- [ ] Document any issues
- [ ] Plan for improvements

## Rollback Plan (if needed)

- [ ] Have backup of database
- [ ] Have previous version of code
- [ ] Document rollback steps
- [ ] Test rollback procedure

## Sign-Off

- [ ] QA approved
- [ ] Product owner approved
- [ ] Deployment manager approved
- [ ] Ready for production

## Notes

```
Date Deployed: _______________
Deployed By: _______________
Issues Found: _______________
Resolution: _______________
```

## Success Criteria

✅ Officers can upload before/after images
✅ Citizens can view resolution images
✅ Images are saved to disk
✅ Database records are created
✅ No errors in logs
✅ Performance is acceptable
✅ All tests pass
✅ Users are satisfied

## Contact

For issues during deployment:
- Check SIMPLE_MIGRATION_GUIDE.md
- Review error logs
- Check database permissions
- Verify file permissions
- Contact development team

---

**Status**: Ready for Deployment 🚀
