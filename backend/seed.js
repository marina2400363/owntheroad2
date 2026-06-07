const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/own_the_road';

const seedData = async () => {
  try {
    console.log(`Connecting to database at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database successfully.');

    console.log('Clearing old data from collections...');
    await User.deleteMany();
    await Car.deleteMany();
    await Booking.deleteMany();
    console.log('Collections cleared.');

    console.log('Seeding user profiles...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('AdminPass123!', salt);
    const userPassword = await bcrypt.hash('UserPass123!', salt);

    const users = await User.create([
      {
        name: 'System Admin',
        email: 'admin@owntheroad.com',
        password: adminPassword,
        isAdmin: true,
        licenseImage: '',
      },
      {
        name: 'sandra osama',
        email: 'sandra@gmail.com',
        password: userPassword,
        isAdmin: false,
        licenseImage: '',
      },
      {
        name: 'marina joseph',
        email: 'marina@gmail.com',
        password: userPassword,
        isAdmin: false,
        licenseImage: '',
      },
      {
        name: 'mira sherif',
        email: 'mira@gmail.com',
        password: userPassword,
        isAdmin: false,
        licenseImage: '',
      },
    ]);
    console.log(`Seeded ${users.length} users (1 Admin, 3 Standard).`);

    console.log('Seeding car inventory...');
    const cars = await Car.create([
      {
        make: 'Hyundai',
        model: 'Accent',
        year: 2024,
        type: 'Sedan',
        pricePerDay: 1600 ,
        imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
      },
      {
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        type: 'Sedan',
        pricePerDay: 2500,
        imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
      },
      {
        make: 'Ford',
        model: 'Mustang GT',
        year: 2022,
        type: 'Sports',
        pricePerDay: 10000,
        imageUrl: 'https://images.unsplash.com/photo-1625231334168-35067f8853ed?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        isAvailable: true,
      },
      {
        make: 'Mercedes-Benz',
        model: 'AMG GT',
        year: 2023,
        type: 'Sports',
        pricePerDay: 15000,
        imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
      },
      {
        make: 'Ford',
        model: 'Expedition',
        year: 2023,
        type: 'SUV',
        pricePerDay: 5000,
        imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
      },
      {
        make: 'Mercedes-Benz',
        model: 'AMG GT R',
        year: 2022,
        type: 'Sports',
        pricePerDay: 20000,
        imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
      },
      {
        make: 'Porsche',
        model: 'Panamera',
        year: 2022,
        type: 'Sedan',
        pricePerDay: 1800,
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
      },
      {
        make: 'BMW',
        model: 'M5',
        year: 2022,
        type: 'Sedan',
        pricePerDay: 15000,
        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
      },
      {
        make: 'Jeep',
        model: 'Wrangler Rubicon',
        year: 2023,
        type: 'SUV',
        pricePerDay: 8000,
        imageUrl: 'https://images.unsplash.com/photo-1638373106719-504c488cfc0e?q=80&w=1112&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        isAvailable: true,
      },
      {
        make: 'BMW',
        model: 'M4 Coupe',
        year: 2023,
        type: 'Sports',
        pricePerDay: 20000,
        imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
        isAvailable: true,
      },
    ]);
    console.log(`Seeded ${cars.length} vehicles.`);

    console.log('Seeding rental bookings...');
    const today = new Date();
    
    const start1 = new Date(today);
    start1.setDate(today.getDate() + 1);
    const end1 = new Date(today);
    end1.setDate(today.getDate() + 4);
    
    const start2 = new Date(today);
    start2.setDate(today.getDate() + 7);
    const end2 = new Date(today);
    end2.setDate(today.getDate() + 12);

    const start3 = new Date(today);
    start3.setDate(today.getDate() + 1);
    const end3 = new Date(today);
    end3.setDate(today.getDate() + 3);

    const bookings = await Booking.create([
      {
        user: users[1]._id, 
        car: cars[1]._id, 
        startDate: start1,
        endDate: end1,
        totalPrice: 3 * cars[1].pricePerDay, 
        status: 'confirmed',
      },
      {
        user: users[2]._id,
        car: cars[7]._id, 
        startDate: start2,
        endDate: end2,
        totalPrice: 5 * cars[7].pricePerDay, 
        status: 'pending',
      },
      {
        user: users[3]._id, 
        car: cars[8]._id, 
        startDate: start3,
        endDate: end3,
        totalPrice: 2 * cars[8].pricePerDay, 
        status: 'cancelled',
      },
    ]);
    console.log(`Seeded ${bookings.length} booking entries.`);

    console.log('Database seeding process completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
