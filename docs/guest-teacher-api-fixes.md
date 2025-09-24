# Guest Teacher API - Update and Delete Fixes

## Overview
This document outlines the fixes applied to the Guest Teacher API for update and delete operations.

## Issues Fixed

### 1. Update Operation Issues

#### **Problem**: Password Hashing Missing
- **Issue**: When updating user data, passwords were not being hashed
- **Fix**: Added password hashing logic in the update method
- **Code**: 
  ```javascript
  if (userData.password) {
    const bcrypt = require('bcryptjs');
    userData.password = await bcrypt.hash(userData.password, 10);
  }
  ```

#### **Problem**: Authorization Logic
- **Issue**: Authorization checks might not work correctly
- **Fix**: Improved authorization logic to check both admin role and own profile
- **Code**:
  ```javascript
  const isAdmin = req.user.role === 'admin';
  const isOwnProfile = req.user.userId === guestTeacher.userId;
  
  if (!isAdmin && !isOwnProfile) {
    return res.status(403).json({ 
      success: false, 
      message: 'You can only update your own profile' 
    });
  }
  ```

### 2. Delete Operation Issues

#### **Problem**: Foreign Key Constraint Issues
- **Issue**: Delete operations might fail due to foreign key constraints
- **Fix**: Added transaction support for data consistency
- **Code**:
  ```javascript
  await sequelize.transaction(async (transaction) => {
    await GuestTeacher.destroy({ where: { id }, transaction });
    await User.destroy({ where: { id: guestTeacher.userId }, transaction });
  });
  ```

#### **Problem**: Dependency Checking
- **Issue**: Delete operations didn't properly check for dependencies
- **Fix**: Added comprehensive dependency checking with force delete option
- **Code**:
  ```javascript
  if (!force) {
    const classCount = await Class.count({ where: { guestTeacherId: id } });
    if (classCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete guest teacher. ${classCount} class(es) are assigned. Use ?force=true to force delete.`
      });
    }
  }
  ```

### 3. New Features Added

#### **Soft Delete Alternative**
- **Feature**: Added deactivate method as an alternative to hard delete
- **Endpoint**: `PUT /api/guest-teachers/:id/deactivate`
- **Purpose**: Deactivates user account instead of deleting records
- **Code**:
  ```javascript
  await User.update(
    { isActive: false }, 
    { where: { id: guestTeacher.userId }, transaction }
  );
  ```

## API Endpoints

### Update Guest Teacher
```
PUT /api/guest-teachers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "userData": {
    "name": "Updated Name",
    "email": "updated@example.com",
    "password": "newpassword" // Optional, will be hashed
  },
  "guestTeacherData": {
    "employeeId": "GT001",
    "departmentId": 1,
    "paymentType": "hourly",
    "rate": 50.00,
    "qualification": "Updated Qualification",
    "phone": "+1234567890",
    "address": "Updated Address"
  }
}
```

### Delete Guest Teacher
```
DELETE /api/guest-teachers/:id
Authorization: Bearer <token>

# Force delete (ignores dependencies)
DELETE /api/guest-teachers/:id?force=true
Authorization: Bearer <token>
```

### Deactivate Guest Teacher (Soft Delete)
```
PUT /api/guest-teachers/:id/deactivate
Authorization: Bearer <token>
```

## Response Examples

### Successful Update
```json
{
  "success": true,
  "message": "Guest teacher updated successfully",
  "data": {
    "guestTeacher": {
      "id": 3,
      "userId": 36,
      "employeeId": "GT001",
      "departmentId": 1,
      "paymentType": "hourly",
      "rate": "50.00",
      "qualification": "Updated Qualification",
      "phone": "+1234567890",
      "address": "Updated Address",
      "user": {
        "name": "Updated Name",
        "email": "updated@example.com",
        "role": "teacher",
        "isActive": true
      },
      "department": {
        "name": "Computer Science",
        "code": "CSE"
      }
    }
  }
}
```

### Successful Delete
```json
{
  "success": true,
  "message": "Guest teacher deleted successfully"
}
```

### Successful Deactivate
```json
{
  "success": true,
  "message": "Guest teacher deactivated successfully",
  "data": {
    "guestTeacher": {
      "id": 3,
      "userId": 36,
      "employeeId": "GT001",
      "user": {
        "name": "Guest Teacher",
        "email": "guest@example.com",
        "role": "teacher",
        "isActive": false
      }
    }
  }
}
```

### Error Responses

#### Dependency Error
```json
{
  "success": false,
  "message": "Cannot delete guest teacher. 2 class(es) are assigned to this guest teacher. Use ?force=true to force delete."
}
```

#### Authorization Error
```json
{
  "success": false,
  "message": "You can only update your own profile"
}
```

#### Not Found Error
```json
{
  "success": false,
  "message": "Guest teacher not found"
}
```

## Security Features

### 1. Authorization
- **Admin**: Can update/delete any guest teacher
- **Guest Teacher**: Can only update their own profile
- **Other Users**: Cannot access guest teacher operations

### 2. Data Validation
- **Email Uniqueness**: Prevents duplicate emails
- **Employee ID Uniqueness**: Prevents duplicate employee IDs
- **Department Validation**: Ensures department exists
- **Password Hashing**: Automatically hashes passwords

### 3. Dependency Protection
- **Class Assignments**: Prevents deletion if classes are assigned
- **Salary Records**: Prevents deletion if salary records exist
- **Teaching Sessions**: Prevents deletion if teaching sessions exist
- **Force Delete**: Allows bypassing dependency checks when needed

## Database Transactions

### Update Operations
- Uses individual updates for user and guest teacher data
- Maintains data consistency through proper error handling

### Delete Operations
- Uses database transactions to ensure atomicity
- Deletes guest teacher record first, then user record
- Rolls back on any error

### Deactivate Operations
- Uses transactions for consistency
- Only updates user's `isActive` status
- Preserves all data for potential reactivation

## Testing

### Model Tests
- ✅ All model attributes are correctly defined
- ✅ Field mappings use proper snake_case database columns
- ✅ Indexes reference correct database column names
- ✅ Associations are properly configured

### API Tests
- ✅ Authentication is required for all endpoints
- ✅ Authorization works correctly
- ✅ Update operations handle password hashing
- ✅ Delete operations check dependencies
- ✅ Soft delete alternative works

## Usage Recommendations

### 1. Update Operations
- Use for modifying guest teacher information
- Password updates are automatically hashed
- Email and employee ID uniqueness is enforced

### 2. Delete Operations
- Use for permanent removal of guest teacher records
- Check dependencies first to avoid errors
- Use force delete only when absolutely necessary

### 3. Deactivate Operations
- Use as preferred alternative to delete
- Preserves data for audit purposes
- Allows for easy reactivation if needed

## Migration Notes

### Existing Data
- All existing guest teacher records remain unchanged
- Database schema is backward compatible
- No data migration required

### New Features
- Deactivate endpoint is new and optional
- Force delete parameter is new
- Enhanced error messages provide better guidance

## Conclusion

The Guest Teacher API update and delete operations have been successfully fixed with:

1. **Proper password hashing** for update operations
2. **Transaction support** for delete operations
3. **Comprehensive dependency checking** with force delete option
4. **Soft delete alternative** for safer data management
5. **Enhanced error handling** and user feedback
6. **Improved security** with proper authorization checks

All operations now work reliably and provide clear feedback to users about success or failure conditions.
