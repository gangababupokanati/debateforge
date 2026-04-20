// ═══════════════════════════════════════
// DEBATEFORGE - Main Server File
// ═══════════════════════════════════════

// Step 1: Load environment variables (API keys, secrets)
require('dotenv').config();

// Step 2: Import all packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');

// Step 3: Create the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Step 4: Setup OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Step 5: Middleware (runs on every request)
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.static('public'));

// Rate limiting - max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please slow down.' }
});
app.use('/api/', limiter);

// ═══════════════════════════════════════
// DATABASE MODELS
// ═══════════════════════════════════════

// User model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  securityQuestion: { type: String, default: '' },
  securityAnswer: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Debate model
const debateSchema = new mongoose.Schema({
  userId: { type: String },
  topic: String,
  difficulty: String,
  opponent: String,
  avatar: String,
  messages: [{
    role: String,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  score: Number,
  strengths: [String],
  improvements: [String],
  duration: Number,
  createdAt: { type: Date, default: Date.now }
});
const Debate = mongoose.model('Debate', debateSchema);

// ═══════════════════════════════════════
// AUTHENTICATION ROUTES
// ═══════════════════════════════════════

// Register new user
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const securityQuestion = req.body.securityQuestion || '';
    const securityAnswer = req.body.securityAnswer ? req.body.securityAnswer.toLowerCase().trim() : '';
    const user = new User({ name, email, password: hashedPassword, securityQuestion, securityAnswer });
    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, name: user.name, email: user.email });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// Login existing user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password.' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, name: user.name, email: user.email });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ═══════════════════════════════════════
// DEBATE ROUTE
// ═══════════════════════════════════════

// System prompts for each opponent style
const opponentPrompts = {
  analyst: {
    easy: 'You are The Analyst, a calm debate opponent. Speak like a real person in a conversation, not a textbook. Make ONE strong point using a simple fact or example. Be warm and encouraging. End with a quick question to keep the student talking. Keep responses under 40 words. Be punchy and engaging.',
    medium: 'You are The Analyst, a sharp debate opponent. Speak conversationally, not formally. Make ONE clear data-driven point with a specific number or example. Challenge the student directly but respectfully. End with a pointed question. Keep responses under 50 words. Be concise and engaging.',
    hard: 'You are The Analyst, a rigorous debate opponent. Speak like a confident expert in conversation. Make ONE hard-hitting point backed by evidence. Expose one weakness in their argument. End with a challenging question. Keep responses under 60 words. Be sharp and engaging.'
  },
  challenger: {
    easy: 'You are The Challenger, a bold but friendly opponent. Speak casually, like a debate with a friend. Push back with ONE strong counter-point. Use bold language but stay warm. End with "But what about...?" style question. Keep responses under 40 words. Be punchy and lively.',
    medium: 'You are The Challenger, an aggressive opponent. Speak with fire and confidence. Hit them with ONE bold counter-argument. Use strong, direct language. End by demanding they defend a weak point. Keep responses under 50 words. Be intense and engaging.',
    hard: 'You are The Challenger, a fierce opponent. Speak with maximum intensity. Attack ONE weakness ruthlessly with a sharp counter. Use provocative but not disrespectful rhetoric. End with a tough challenge. Keep responses under 60 words. Be fierce and captivating.'
  },
  philosopher: {
    easy: 'You are The Philosopher, a thoughtful opponent. Speak like a curious friend. Ask ONE deep but simple question that makes them think. Offer a brief thought. Keep responses under 40 words. Be intriguing and engaging.',
    medium: 'You are The Philosopher, a Socratic opponent. Speak with quiet intensity. Challenge ONE assumption with a probing question. Briefly explain why it matters. Keep responses under 50 words. Be thought-provoking and engaging.',
    hard: 'You are The Philosopher, an intense Socratic opponent. Speak with sharp precision. Expose ONE hidden assumption with a cutting question. Force them to rethink. Keep responses under 60 words. Be penetrating and captivating.'
  }
};

const topicOpenings = {
  technology: 'The debate topic is: Does artificial intelligence create more jobs than it eliminates? Take the opposing position to the student.',
  education: 'The debate topic is: Can online learning be as effective as traditional classroom education? Take the opposing position to the student.',
  politics: 'The debate topic is: Is direct democracy better than representative democracy in the digital age? Take the opposing position to the student.',
  environment: 'The debate topic is: Is nuclear energy the best solution to climate change? Take the opposing position to the student.'
};

app.post('/api/debate', async (req, res) => {
  try {
    const { messages, topic, difficulty, opponent } = req.body;

    const systemPrompt = opponentPrompts[opponent]?.[difficulty] || opponentPrompts.analyst.medium;
    const topicContext = topicOpenings[topic] || 'The debate topic is: ' + topic + '. Take the opposing position to the student.';

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 200,
      messages: [
        { role: 'system', content: systemPrompt + ' ' + topicContext },
        ...messages.map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.text
        }))
      ]
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('Debate error:', err.message);
    res.status(500).json({ error: 'AI is not responding. Please try again.' });
  }
});

// ═══════════════════════════════════════
// REPORT ROUTE
// ═══════════════════════════════════════

app.post('/api/report', async (req, res) => {
  try {
    const { messages, topic, difficulty, opponent, duration } = req.body;

    // Extract ONLY user messages
    const userMessages = messages.filter(m => m.role === 'user');
    const userTranscript = userMessages.map((m, i) => 'Argument ' + (i + 1) + ': ' + m.text).join('\n');
    const totalWords = userMessages.reduce((sum, m) => sum + m.text.split(/\s+/).filter(w => w.length > 0).length, 0);

    // If user barely participated, return honest low scores immediately
    if (userMessages.length === 0) {
      return res.json({
        overallScore: 0,
        communication: { score: 0, clarity: 0, pronunciation: 0, fluency: 0, feedback: 'No participation recorded. The student did not speak or type during the debate.' },
        defense: { score: 0, logicalReasoning: 0, supportingArguments: 0, useOfExamples: 0, feedback: 'No arguments were presented to defend any position.' },
        challenging: { score: 0, questioningOpponent: 0, identifyingWeaknesses: 0, feedback: 'No challenges were made against the opponent.' },
        rebuttal: { score: 0, respondingToOpponent: 0, counterArguments: 0, feedback: 'No rebuttals were given.' },
        confidence: { score: 0, voiceStrength: 0, noHesitation: 0, feedback: 'Confidence could not be measured without participation.' },
        strengths: ['No strengths to report - debate was not attempted'],
        improvements: [
          'You must actively participate in the debate to receive feedback',
          'Try speaking or typing at least one argument next time',
          'Start with a simple opinion about the topic',
          'Practice forming basic sentences about your viewpoint',
          'Engage with the AI opponent to build confidence'
        ],
        weaknesses: [
          'Complete lack of participation',
          'No arguments presented',
          'No engagement with the opponent',
          'Unable to demonstrate any debate skills'
        ]
      });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 900,
      messages: [
        {
          role: 'system',
          content: `You are a STRICT and HONEST debate coach. You analyze ONLY the student's arguments, NEVER the AI opponent's responses. 

CRITICAL SCORING RULES:
- If student spoke 0 times: ALL scores MUST be 0
- If student spoke 1-2 times with under 20 words total: scores MUST be 1-3 out of 10
- If student spoke with 20-50 words: scores should be 3-5 out of 10
- If student spoke with 50-150 words: scores should be 5-7 out of 10
- If student spoke with 150+ words with good arguments: scores can be 7-10 out of 10
- Overall score = average of all scores * 10

BE HONEST. Do NOT give fake encouragement. If the student did poorly, say so clearly.

Return ONLY valid JSON in this exact format:
{"overallScore":0-100,"communication":{"score":0-10,"clarity":0-10,"pronunciation":0-10,"fluency":0-10,"feedback":"honest one sentence"},"defense":{"score":0-10,"logicalReasoning":0-10,"supportingArguments":0-10,"useOfExamples":0-10,"feedback":"honest one sentence"},"challenging":{"score":0-10,"questioningOpponent":0-10,"identifyingWeaknesses":0-10,"feedback":"honest one sentence"},"rebuttal":{"score":0-10,"respondingToOpponent":0-10,"counterArguments":0-10,"feedback":"honest one sentence"},"confidence":{"score":0-10,"voiceStrength":0-10,"noHesitation":0-10,"feedback":"honest one sentence"},"strengths":["str1","str2","str3","str4","str5"],"improvements":["imp1","imp2","imp3","imp4","imp5"],"weaknesses":["weak1","weak2","weak3","weak4"]}

Provide 5 strengths, 5 improvements, and 4 weaknesses. If the student did poorly, strengths can mention tiny positives like "attempted to participate" but be honest about weaknesses.`
        },
        {
          role: 'user',
          content: `Analyze ONLY this student's performance in a ${topic} debate (${difficulty} difficulty, vs ${opponent}).

STUDENT STATS:
- Total arguments made: ${userMessages.length}
- Total words spoken: ${totalWords}
- Debate duration: ${duration} seconds

STUDENT'S ARGUMENTS (analyze ONLY these, ignore what the AI said):
${userTranscript || '(The student did not speak at all)'}

Give honest scores based on the student's actual performance. Do not be generous if the performance was poor.`
        }
      ]
    });

    let analysis;
    try {
      const text = response.choices[0].message.content;
      analysis = JSON.parse(text.replace(/```json|```/g, '').trim());
      // Ensure weaknesses array exists
      if (!analysis.weaknesses) analysis.weaknesses = ['No specific weaknesses identified'];
    } catch (e) {
      console.error('Parse error:', e);
      analysis = {
        overallScore: userMessages.length === 0 ? 0 : 30,
        communication: { score: 3, clarity: 3, pronunciation: 3, fluency: 3, feedback: 'Limited data to evaluate.' },
        defense: { score: 3, logicalReasoning: 3, supportingArguments: 3, useOfExamples: 3, feedback: 'Limited data to evaluate.' },
        challenging: { score: 3, questioningOpponent: 3, identifyingWeaknesses: 3, feedback: 'Limited data to evaluate.' },
        rebuttal: { score: 3, respondingToOpponent: 3, counterArguments: 3, feedback: 'Limited data to evaluate.' },
        confidence: { score: 3, voiceStrength: 3, noHesitation: 3, feedback: 'Limited data to evaluate.' },
        strengths: ['Attempted the debate'],
        improvements: ['Speak more', 'Develop clearer arguments', 'Use examples', 'Challenge the opponent', 'Practice regularly'],
        weaknesses: ['Limited participation', 'Weak argumentation', 'Needs more practice', 'Low engagement']
      };
    }

    res.json(analysis);
  } catch (err) {
    console.error('Report error:', err.message);
    res.status(500).json({ error: 'Could not generate report.' });
  }
});
// ═══════════════════════════════════════
// SAVE DEBATE ROUTE
// ═══════════════════════════════════════

app.post('/api/save-debate', async (req, res) => {
  try {
    const debate = new Debate(req.body);
    await debate.save();
    res.json({ success: true, id: debate._id });
  } catch (err) {
    console.error('Save error:', err.message);
    res.status(500).json({ error: 'Could not save debate.' });
  }
});

// ═══════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════

// FORGOT PASSWORD ROUTE
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;
    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'No account found with this email.' });
    if (!user.securityAnswer) return res.status(400).json({ error: 'No security question set for this account.' });
    if (user.securityAnswer.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
      return res.status(400).json({ error: 'Security answer is incorrect.' });
    }
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password reset successful!' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.post('/api/get-security-question', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'No account found with this email.' });
    if (!user.securityQuestion) return res.status(400).json({ error: 'No security question set for this account.' });
    res.json({ question: user.securityQuestion });
  } catch (err) {
    console.error('Get security question error:', err.message);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// ═══════════════════════════════════════
// D-ID AVATAR VIDEO ROUTE
// ═══════════════════════════════════════

app.post('/api/create-talk', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required.' });

    const DID_API_KEY = process.env.DID_API_KEY;
    if (!DID_API_KEY) return res.status(500).json({ error: 'D-ID API key not configured.' });

    // Step 1: Create talk video
    const createRes = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + DID_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: 'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.png',
        script: {
          type: 'text',
          input: text,
          provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' }
        },
        config: { fluent: true }
      })
    });

    const createData = await createRes.json();
    if (!createData.id) {
      console.error('D-ID create error:', createData);
      return res.status(500).json({ error: 'Could not create avatar video.' });
    }

    const talkId = createData.id;

    // Step 2: Poll for result (max 30 seconds)
    let videoUrl = null;
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 2000));

      const pollRes = await fetch('https://api.d-id.com/talks/' + talkId, {
        headers: { 'Authorization': 'Basic ' + DID_API_KEY }
      });
      const pollData = await pollRes.json();

      if (pollData.status === 'done' && pollData.result_url) {
        videoUrl = pollData.result_url;
        break;
      } else if (pollData.status === 'error') {
        console.error('D-ID error:', pollData);
        return res.status(500).json({ error: 'Avatar video generation failed.' });
      }
    }

    if (!videoUrl) {
      return res.status(500).json({ error: 'Video generation timed out.' });
    }

    res.json({ video_url: videoUrl });
  } catch (err) {
    console.error('D-ID error:', err.message);
    res.status(500).json({ error: 'Could not generate avatar video.' });
  }
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected!');
    app.listen(PORT, () => {
      console.log('========================================');
      console.log('  DebateForge server is running!');
      console.log('  Open: http://localhost:' + PORT);
      console.log('========================================');
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
  });

// ═══════════════════════════════════════
// PROFILE UPDATE ROUTE
// ═══════════════════════════════════════

app.post('/api/update-profile', async (req, res) => {
  try {
    const { email, name, newEmail } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found.' });
    if (name) user.name = name;
    if (newEmail) user.email = newEmail;
    await user.save();
    const token = jwt.sign({ userId: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, name: user.name, email: user.email });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

// ═══════════════════════════════════════
// CHANGE PASSWORD ROUTE
// ═══════════════════════════════════════

app.post('/api/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found.' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect.' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err) {
    console.error('Password change error:', err.message);
    res.status(500).json({ error: 'Could not change password.' });
  }
});

// ═══════════════════════════════════════
// DEBATE HISTORY ROUTE
// ═══════════════════════════════════════

app.get('/api/history/:userId', async (req, res) => {
  try {
    const debates = await Debate.find({ $or: [{ userId: req.params.userId }, { 'userId': decodeURIComponent(req.params.userId) }] }).sort({ createdAt: -1 }).limit(20);
    const totalAttempts = debates.length;
    const avgScore = totalAttempts > 0 ? Math.round(debates.reduce((a, d) => a + (d.score || 0), 0) / totalAttempts) : 0;
    const bestScore = totalAttempts > 0 ? Math.max(...debates.map(d => d.score || 0)) : 0;
    let level = 'Beginner';
    if (avgScore >= 80) level = 'Expert';
    else if (avgScore >= 60) level = 'Advanced';
    else if (avgScore >= 40) level = 'Intermediate';
    res.json({ totalAttempts, avgScore, bestScore, level, debates });
  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ error: 'Could not fetch history.' });
  }
});