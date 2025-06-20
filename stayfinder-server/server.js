// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(cors({
  origin: ['http://localhost:5173', 'https://stay-finder-app-xi.vercel.app/'], 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stayfinder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});



// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['guest', 'host'], default: 'guest' },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Listing Schema
const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  guests: { type: Number, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  images: [{ type: String }],
  amenities: [{ type: String }],
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Listing = mongoose.model('Listing', listingSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// AUTH ROUTES

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'guest' } = req.body;
    const normalizedEmail=email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email:normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    // Find user
    const user = await User.findOne({ email : normalizedEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LISTING ROUTES

// Get all listings (with search and filters)
app.get('/api/listings', async (req, res) => {
  try {
    const { search, location, type, minPrice, maxPrice, guests, page = 1, limit = 12 } = req.query;
    
    let query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      query.type = { $regex: type, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (guests) {
      query.guests = { $gte: Number(guests) };
    }

    const skip = (page - 1) * limit;
    
    const listings = await Listing.find(query)
      .populate('host', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Listing.countDocuments(query);

    res.json({
      listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single listing
app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('host', 'name email');
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create listing (host only)
app.post('/api/listings', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      type,
      price,
      guests,
      bedrooms,
      bathrooms,
      amenities
    } = req.body;

    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const listing = new Listing({
      title,
      description,
      location,
      type,
      price: Number(price),
      guests: Number(guests),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      images,
      amenities: Array.isArray(amenities) ? amenities : [amenities].filter(Boolean),
      host: req.user.userId
    });

    await listing.save();
    await listing.populate('host', 'name');

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update listing (host only)
app.put('/api/listings/:id', authenticateToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.host.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('host', 'name');

    res.json({
      message: 'Listing updated successfully',
      listing: updatedListing
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete listing (host only)
app.delete('/api/listings/:id', authenticateToken, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.host.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    await Listing.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get host's listings
app.get('/api/host/listings', authenticateToken, async (req, res) => {
  try {
    const listings = await Listing.find({ host: req.user.userId })
      .sort({ createdAt: -1 });
    
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BOOKING ROUTES

// Create booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today= new Date();
    today.setHours(0,0,0,0);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }
    
    if (checkInDate < today) {
      return res.status(400).json({ error: 'Check-in date cannot be in the past' });
    }

    if (checkOutDate<today){
      return res.status(400).json({ error: 'Check-in date cannot be in the past' });
    }

    // Get listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (guests > listing.guests) {
      return res.status(400).json({ error: 'Number of guests exceeds listing capacity' });
    }

    // Check for existing bookings (simplified - doesn't handle complex overlap scenarios)
    const existingBooking = await Booking.findOne({
      listing: listingId,
      status: { $ne: 'cancelled' },
      $or: [
        { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'Property is not available for selected dates' });
    }

    // Calculate total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = (listing.price * nights) + 29; // Adding service fee

    const booking = new Booking({
      listing: listingId,
      guest: req.user.userId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: Number(guests),
      totalPrice
    });

    await booking.save();
    await booking.populate('listing', 'title location images');
    await booking.populate('guest', 'name email');

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user.userId })
      .populate('listing', 'title location images price')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get booking by ID
app.get('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('listing', 'title location images price')
      .populate('guest', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user is the guest or the host of the listing
    if (booking.guest._id.toString() !== req.user.userId && 
        booking.listing.host.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
app.patch('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.guest.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get host's bookings
app.get('/api/host/bookings', authenticateToken, async (req, res) => {
  try {
    const hostListings = await Listing.find({ host: req.user.userId }).select('_id');
    const listingIds = hostListings.map(listing => listing._id);

    const bookings = await Booking.find({ listing: { $in: listingIds } })
      .populate('listing', 'title location')
      .populate('guest', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Promote a user to a host route
// Promote user to host
app.patch('/api/users/promote', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'host') return res.status(400).json({ error: 'Already a host' });

    user.role = 'host';
    await user.save();

    res.json({ message: 'User promoted to host', user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// SEED DATA (for development)
app.post('/api/seed', async (req, res) => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Booking.deleteMany({});

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'host'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'host'
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: hashedPassword,
        role: 'guest'
      }
    ]);

    // Create sample listings
    const listings = await Listing.insertMany([
      {
        title: 'Modern Downtown Apartment',
        description: 'A beautiful modern apartment in the heart of downtown with stunning city views.',
        location: 'New York, NY',
        type: 'Apartment',
        price: 150,
        guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'
        ],
        amenities: ['wifi', 'kitchen', 'air_conditioning', 'heating'],
        host: users[0]._id,
        rating: 4.8,
        reviews: 24
      },
      {
        title: 'Desert Oasis Resort',
        location: 'Scottsdale, Arizona',
        price: 179,
        rating: 4.6,
        reviews: 112,
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
        ],
        host: users[0]._id,
        guests: 6,
        bedrooms: 3,
        bathrooms: 3,
        amenities: ['wifi', 'pool', 'spa', 'desert_view'],
        description: 'Relax and rejuvenate in this luxurious desert retreat featuring a private pool and spa with stunning mountain views.',
        type: 'Resort'
      },
      {
        title: 'Historic Countryside Manor',
        location: 'Cotswolds, England',
        price: 219,
        rating: 4.8,
        reviews: 94,
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'
        ],
        host: users[1]._id,
        guests: 10,
        bedrooms: 5,
        bathrooms: 4,
        amenities: ['wifi', 'parking', 'garden', 'fireplace'],
        description: 'Step back in time in this beautifully restored 18th-century manor house set in the picturesque English countryside.',
        type: 'Manor'
      },
      {
        title: 'Tropical Paradise Bungalow',
        location: 'Bali, Indonesia',
        price: 99,
        rating: 4.9,
        reviews: 156,
        images: [
          'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'
        ],
        host: users[1]._id,
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['wifi', 'pool', 'garden', 'beach_access'],
        description: 'Immerse yourself in tropical bliss at this authentic Balinese bungalow surrounded by lush gardens and rice paddies.',
        type: 'Bungalow'
      },
      {
        title: 'Modern City Loft',
        location: 'New York, NY',
        price: 149,
        rating: 4.7,
        reviews: 203,
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'
        ],
        host: users[1]._id,
        guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['wifi', 'gym', 'rooftop', 'city_view'],
        description: 'Stay in the heart of Manhattan in this sleek, modern loft with stunning city views and premium amenities.',
        type: 'Loft'
      },
      {
        title: 'Cozy Mountain Cabin',
        location: 'Aspen, Colorado',
        price: 189,
        rating: 4.8,
        reviews: 89,
        images: [
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
        ],
        host: users[0]._id,
        guests: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ['wifi', 'parking', 'fireplace', 'mountain_view'],
        description: 'Escape to this charming mountain cabin surrounded by pristine wilderness. Perfect for outdoor enthusiasts and those seeking tranquility.',
        type: 'Cabin'
      },
      {
        title: 'Luxury Beachfront Villa',
        location: 'Malibu, California',
        price: 299,
        rating: 4.9,
        reviews: 127,
        images: [
          'https://images.unsplash.com/photo-1502005229762-cf1b2da697f4?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'
        ],
        host: users[1]._id,
        guests: 8,
        bedrooms: 4,
        bathrooms: 3,
        amenities: ['wifi', 'parking', 'pool', 'beach_access'],
        description: 'Experience luxury living in this stunning beachfront villa with panoramic ocean views. Perfect for families or groups looking for an unforgettable getaway.',
        type: 'Villa'
      },
      {
        title: 'Cozy Beach House',
        description: 'Relax in this charming beach house just steps away from the ocean.',
        location: 'Miami, FL',
        type: 'House',
        price: 200,
        guests: 6,
        bedrooms: 3,
        bathrooms: 2,
        images: [
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
        ],
        amenities: ['wifi', 'kitchen', 'pool', 'parking'],
        host: users[1]._id,
        rating: 4.9,
        reviews: 18
      },
      {
        title: 'Mountain Cabin Retreat',
        description: 'Escape to nature in this rustic cabin surrounded by beautiful mountains.',
        location: 'Aspen, CO',
        type: 'Cabin',
        price: 180,
        guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        images: [
          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'
        ],
        amenities: ['wifi', 'kitchen', 'fireplace', 'hiking'],
        host: users[0]._id,
        rating: 4.7,
        reviews: 32
      }
    ]);

    res.json({
      message: 'Database seeded successfully',
      users: users.length,
      listings: listings.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 StayFinder server running on port ${PORT}`);
});

module.exports = app;