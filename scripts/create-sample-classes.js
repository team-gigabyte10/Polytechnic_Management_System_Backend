const { sequelize } = require('../config/database');
const { Department, Subject, Teacher, Class } = require('../models');

async function createSampleData() {
  try {
    console.log('Creating sample data...');

    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Create a sample department
    const department = await Department.findOrCreate({
      where: { code: 'CSE' },
      defaults: {
        name: 'Computer Science Engineering',
        code: 'CSE'
      }
    });

    console.log('Department created/found:', department[0].name);

    // Create sample subjects
    const subjects = await Promise.all([
      Subject.findOrCreate({
        where: { code: 'CS101' },
        defaults: {
          name: 'Programming Fundamentals',
          code: 'CS101',
          departmentId: department[0].id,
          semester: 1,
          credits: 4,
          theoryHours: 3,
          practicalHours: 2
        }
      }),
      Subject.findOrCreate({
        where: { code: 'CS102' },
        defaults: {
          name: 'Data Structures',
          code: 'CS102',
          departmentId: department[0].id,
          semester: 2,
          credits: 4,
          theoryHours: 3,
          practicalHours: 2
        }
      }),
      Subject.findOrCreate({
        where: { code: 'CS201' },
        defaults: {
          name: 'Database Management',
          code: 'CS201',
          departmentId: department[0].id,
          semester: 3,
          credits: 3,
          theoryHours: 2,
          practicalHours: 2
        }
      })
    ]);

    console.log('Subjects created/found:', subjects.length);

    // Create a sample teacher
    const teacher = await Teacher.findOrCreate({
      where: { employeeId: 'T001' },
      defaults: {
        employeeId: 'T001',
        departmentId: department[0].id,
        designation: 'Assistant Professor',
        qualification: 'M.Tech Computer Science',
        experienceYears: 5,
        salary: 50000,
        joiningDate: new Date('2020-01-01'),
        phone: '9876543210',
        address: 'Sample Address'
      }
    });

    console.log('Teacher created/found:', teacher[0].employeeId);

    // Create sample classes
    const classes = await Promise.all([
      Class.findOrCreate({
        where: { 
          subjectId: subjects[0][0].id,
          scheduleDay: 'monday',
          startTime: '09:00:00'
        },
        defaults: {
          subjectId: subjects[0][0].id,
          teacherId: teacher[0].id,
          roomNumber: 'A101',
          scheduleDay: 'monday',
          startTime: '09:00:00',
          endTime: '10:30:00',
          classType: 'theory',
          isActive: true
        }
      }),
      Class.findOrCreate({
        where: { 
          subjectId: subjects[1][0].id,
          scheduleDay: 'tuesday',
          startTime: '10:00:00'
        },
        defaults: {
          subjectId: subjects[1][0].id,
          teacherId: teacher[0].id,
          roomNumber: 'A102',
          scheduleDay: 'tuesday',
          startTime: '10:00:00',
          endTime: '11:30:00',
          classType: 'theory',
          isActive: true
        }
      }),
      Class.findOrCreate({
        where: { 
          subjectId: subjects[2][0].id,
          scheduleDay: 'wednesday',
          startTime: '14:00:00'
        },
        defaults: {
          subjectId: subjects[2][0].id,
          teacherId: teacher[0].id,
          roomNumber: 'B101',
          scheduleDay: 'wednesday',
          startTime: '14:00:00',
          endTime: '15:30:00',
          classType: 'practical',
          isActive: true
        }
      })
    ]);

    console.log('Classes created/found:', classes.length);

    // Display created classes
    const allClasses = await Class.findAll({
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['name', 'code']
        },
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['employeeId', 'designation']
        }
      ]
    });

    console.log('\n=== Available Classes ===');
    allClasses.forEach(cls => {
      console.log(`ID: ${cls.id} | ${cls.subject.name} (${cls.subject.code}) | ${cls.scheduleDay} ${cls.startTime}-${cls.endTime} | Teacher: ${cls.teacher.employeeId}`);
    });

    console.log('\nSample data created successfully!');
    console.log('\nYou can now test the attendance API with these class IDs:');
    allClasses.forEach(cls => {
      console.log(`- Class ID ${cls.id}: ${cls.subject.name}`);
    });

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
createSampleData();
